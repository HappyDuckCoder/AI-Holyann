'use client'

import React, {createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo} from 'react'

export type UserRole = 'user' | 'mentor' | 'admin'

export interface User {
    email: string
    name: string
    role: UserRole
    avatar?: string
}

interface AuthContextType {
    user: User | null
    login: (email: string, name: string, role?: UserRole) => void
    logout: () => void
    isAuthenticated: boolean
    hasRole: (roles: UserRole | UserRole[]) => boolean
    authReady: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [authReady, setAuthReady] = useState(false)

    // read saved user on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('user')
            if (saved) {
                const parsed: User = JSON.parse(saved)
                setUser(parsed)
            }
        } catch (e) {
            console.error('Error reading saved user from localStorage', e)
        } finally {
            // mark auth as ready regardless
            setAuthReady(true)
        }
    }, [])

    const login = useCallback((email: string, name: string, role: UserRole = 'user') => {
        const userData: User = {email, name, role}
        setUser(userData)
        try {
            localStorage.setItem('user', JSON.stringify(userData))
        } catch (e) {
            console.error('Failed to save user to localStorage', e)
        }
    }, [])

    const logout = useCallback(() => {
        setUser(null)
        try {
            localStorage.removeItem('user')
        } catch (e) {
            console.error('Failed to remove user from localStorage', e)
        }
    }, [])

    const isAuthenticated = useMemo(() => !!user, [user])

    const hasRole = useCallback((roles: UserRole | UserRole[]) => {
        if (!user) return false
        const allowedRoles = Array.isArray(roles) ? roles : [roles]
        return allowedRoles.includes(user.role)
    }, [user])

    const contextValue = useMemo<AuthContextType>(() => ({
        user,
        login,
        logout,
        isAuthenticated,
        hasRole,
        authReady,
    }), [user, login, logout, isAuthenticated, hasRole, authReady])

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within an AuthProvider')
    return context
}
