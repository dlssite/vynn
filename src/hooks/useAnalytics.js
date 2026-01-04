import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import api from '../services/api';

export const useAnalytics = (profileId) => {
    const [sessionId, setSessionId] = useState(null);
    const [isStarted, setIsStarted] = useState(false);
    const pingIntervalRef = useRef(null);

    // 1. Start Session
    const startSession = useCallback(async () => {
        if (isStarted) return;

        try {
            // Get or create generic visitor token
            let visitorId = localStorage.getItem('vynn_visitor_id');
            if (!visitorId) {
                visitorId = uuidv4();
                localStorage.setItem('vynn_visitor_id', visitorId);
            }

            const res = await api.post('/analytics/start', {
                profileId,
                visitorId,
                referrer: document.referrer
            });

            if (res.data.status === 'started') {
                setSessionId(res.data.sessionId);
                setIsStarted(true);
            }
        } catch (error) {
            console.error('Failed to start analytics session:', error);
            // Non-blocking error - we just fail silently to not break user experience
        }
    }, [profileId, isStarted]);

    // 2. Heartbeat (Every 15s)
    useEffect(() => {
        if (sessionId) {
            pingIntervalRef.current = setInterval(async () => {
                try {
                    await api.put('/analytics/heartbeat', { sessionId });
                } catch (err) {
                    // Silent fail
                }
            }, 15000);
        }

        return () => {
            if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        };
    }, [sessionId]);

    // 3. Track Click
    const trackClick = useCallback(async (linkId, url, type = 'link') => {
        if (!sessionId) return;
        try {
            await api.post('/analytics/click', {
                sessionId,
                linkId,
                url,
                type
            });
        } catch (error) {
            // Silent fail
        }
    }, [sessionId]);

    return {
        startSession,
        trackClick,
        isStarted
    };
};
