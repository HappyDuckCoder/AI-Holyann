'use client'
import {useEffect} from 'react'
import {useAuth, UserRole} from '@/contexts/AuthContext'
import {useRouter, usePathname} from 'next/navigation'
import Loading from '@/components/dashboard/Loading'
import Register from '@/components/dashboard/Register'

export default function RegisterPage() {
    const {login, isAuthenticated, user, authReady} = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    useEffect(() => {
        if (isAuthenticated) {
            if (!authReady) return
            if (isAuthenticated && user) {
                // Redirect based on user role
                let target = '/dashboard'
                switch (user.role) {
                    case 'admin':
                        target = '/dashboard/admin'
                        break
                    case 'mentor':
                        target = '/dashboard/mentor'
                        break
                    case 'user':
                    default:
                        target = '/dashboard'
                        break
                }
                if (pathname !== target) router.replace(target)
            }
        }
    ,
        [authReady, isAuthenticated, user, router, pathname]
    )

        const handleRegister = (email: string, name: string, role: UserRole) => {
            // Only set auth state here; navigation will be handled by effect when authReady/isAuthenticated updates
            login(email, name, role)
        }

        if (!authReady) {
            return <Loading message="Đang kiểm tra quyền truy cập..."/>
        }

        // If already authenticated we'll have redirected; still render fallback

        <main
