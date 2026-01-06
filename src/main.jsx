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
                                style: {
                                    background: '#1a1a2e',
                                    color: '#fff',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }
                            }}
                        />
                    </AuthProvider>
                </ConfigProvider>
            </BrowserRouter>
        </HelmetProvider>
    </React.StrictMode>,
)
