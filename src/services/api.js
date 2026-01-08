import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_VYNN_API_PATH || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('vynn_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Ignore 401s from login endpoint to allow component to handle "Invalid credentials"
        if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
            localStorage.removeItem('vynn_token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// Referral API
export const referralAPI = {
    // Referral codes
    getCode: () => api.get('/referral/code'),
    validateCode: (code) => api.post('/referral/validate', { code }),
    getStats: () => api.get('/referral/stats'),
    getReferrals: () => api.get('/referral/list'),
    getReferrer: () => api.get('/referral/referrer'),

    // Credits
    getCredits: () => api.get('/referral/credits'),
    getCreditHistory: () => api.get('/referral/credits/history'),
    giftCredits: (username, amount) => api.post('/referral/credits/gift', { username, amount }),

    // Analytics
    trackClick: (code) => api.post(`/referral/click/${code}`)
};

export default api
