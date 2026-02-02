import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ConfigProvider } from './context/ConfigContext'
import './styles/index.css'

import { HelmetProvider } from 'react-helmet-async'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <HelmetProvider>
            <BrowserRouter>
                <ConfigProvider>
                    <AuthProvider>
                        <App />
                        <Toaster
                            position="bottom-center"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: 'rgba(10, 10, 15, 0.8)',
                                    color: '#fff',
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    padding: '12px 20px',
                                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                                },
                                success: {
                                    iconTheme: {
                                        primary: '#f97316',
                                        secondary: '#fff',
                                    },
                                    style: {
                                        border: '1px solid rgba(249, 115, 22, 0.2)',
                                    }
                                },
                                error: {
                                    iconTheme: {
                                        primary: '#ef4444',
                                        secondary: '#fff',
                                    },
                                    style: {
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                    }
                                }
                            }}
                        />
                    </AuthProvider>
                </ConfigProvider>
            </BrowserRouter>
        </HelmetProvider>
    </React.StrictMode>,
)
