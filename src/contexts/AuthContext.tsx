'use client'

import React, {createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo} from 'react'
import {useSession} from 'next-auth/react'

export type UserRole = 'user' | 'student' | 'mentor' | 'admin'

export interface User {
    id: string
    email: string
    name: string
    role: UserRole
    avatar?: string
}

interface AuthContextType {
    user: User | null
    token: string | null
    login: (email: string, name: string, role?: UserRole, avatar?: string) => void
    logout: () => void
    isAuthenticated: boolean
    hasRole: (roles: UserRole | UserRole[]) => boolean
    authReady: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [authReady, setAuthReady] = useState(false)
    const {data: session, status} = useSession()

    // Sync with NextAuth session
    useEffect(() => {
        if (status === 'loading') return

        if (session?.user && status === 'authenticated') {
            // Normalize role to lowercase for consistency
            const rawRole = (session.user.role as string)?.toLowerCase() || 'user'
            // Ensure it's a valid UserRole
            const role: UserRole = (rawRole === 'student' || rawRole === 'mentor' || rawRole === 'admin')
                ? rawRole
                : 'user'

            const userData: User = {
                id: (session.user as any).id || '',
                email: session.user.email || '',
                name: session.user.name || session.user.email || 'Người dùng',
                role: role,
                avatar: session.user.image || undefined,
            }
            setUser(userData)

            // Get token from localStorage or session
            const savedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
            if (savedToken) {
                setToken(savedToken)
            }

            try {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('user', JSON.stringify(userData))
                }
            } catch (e) {
                console.error('Failed to save user to localStorage', e)
            }
            setAuthReady(true)
        } else if (status === 'unauthenticated') {
            // Try loading from localStorage
            try {
                const saved = typeof window !== 'undefined' ? localStorage.getItem('user') : null
                const savedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null

                if (saved) {
                    const parsed: any = JSON.parse(saved)
                    // Normalize role
                    let role = (parsed.role || 'user') as string
                    if (role === 'STUDENT') role = 'student'
                    const mapped: User = {
                        id: parsed.id || parsed.user_id || '',
                        email: parsed.email,
                        name: parsed.name || parsed.full_name || parsed.email,
                        role: role.toLowerCase() as UserRole,
                        avatar: parsed.avatar_url || parsed.avatar,
                    }
                    setUser(mapped)
                    if (savedToken) {
                        setToken(savedToken)
                    }
                }
            } catch (e) {
                console.error('Error reading saved user from localStorage', e)
            } finally {
                setAuthReady(true)
            }
        }
    }, [session, status])

    const login = useCallback((email: string, name: string, role: UserRole = 'user', avatar?: string) => {
        const normalizedRole = (role || 'user') as UserRole
        const userData: User = {email, name, role: normalizedRole, avatar}
        setUser(userData)
        try {
            if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(userData))
        } catch (e) {
            console.error('Failed to save user to localStorage', e)
        }
    }, [])

    const logout = useCallback(async () => {
        try {
            // Gọi API logout để xóa cookie trên server
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                console.warn('⚠️ Logout API failed, but continuing with local cleanup')
            }
        } catch (error) {
            console.error('❌ Error calling logout API:', error)
        } finally {
            // Luôn xóa thông tin local dù API có lỗi hay không
            setUser(null)
            try {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('user')
                    localStorage.removeItem('token')
                    localStorage.removeItem('session')
                }
            } catch (e) {
                console.error('Failed to remove user from localStorage', e)
            }
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
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

// Alias để sử dụng trong hooks
export const useAuthContext = useAuth
