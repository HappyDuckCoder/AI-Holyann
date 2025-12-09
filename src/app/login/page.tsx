'use client'
import {useAuth} from '@/contexts/AuthContext'
import {useAuth, UserRole} from '@/contexts/AuthContext'
import {useRouter, usePathname} from 'next/navigation'
import Login from '@/components/dashboard/Login'
import Loading from '@/components/dashboard/Loading'

export default function LoginPage() {
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

        const handleLogin = (email: string, name: string, role: UserRole) => {
            // Only set auth state here; navigation handled by effect
            login(email, name, role)
        }

        if (!authReady) {
            return <Loading message="Đang kiểm tra quyền truy cập..."/>
        }

