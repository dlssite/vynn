import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const token = localStorage.getItem('vynn_token')
        if (!token) {
            setLoading(false)
            return
        }

        try {
            const response = await api.get('/auth/me')
            const { user: userData, profile } = response.data
            setUser({ ...userData, avatar: profile?.avatar })
        } catch (error) {
            localStorage.removeItem('vynn_token')
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password })
        const { token } = response.data
        localStorage.setItem('vynn_token', token)
        await checkAuth()
        return true
    }

    const signup = async (email, password, username) => {
        const response = await api.post('/auth/register', { email, password, username })
        const { token } = response.data
        localStorage.setItem('vynn_token', token)
        await checkAuth()
        return true
    }

    const loginWithToken = async (token) => {
        localStorage.setItem('vynn_token', token)
        await checkAuth()
    }

    const logout = () => {
        localStorage.removeItem('vynn_token')
        setUser(null)
    }

    const value = {
        user,
        loading,
        login,
        loginWithToken,
        signup,
        logout,
        isAuthenticated: !!user
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
