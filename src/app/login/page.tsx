'use client'
import {useAuth} from '@/contexts/AuthContext'
import {useRouter} from 'next/navigation'
import {useEffect} from 'react'
import Login from '@/components/Login'
import Loading from '@/components/Loading'

export default function LoginPage() {
    const {login, isAuthenticated} = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard')
        }
    }, [isAuthenticated, router])

    const handleLogin = (email: string, name: string) => {
        login(email, name)
        router.push('/dashboard')
    }

    // 1. Loading State: Cũng cần nền tối để không bị chớp trắng
    if (isAuthenticated) {
        return (
            <div
                className="min-h-screen flex items-center justify-center bg-white dark:bg-background transition-colors duration-300">
                <Loading/>
            </div>
        )
    }

    // 2. Login Page: Bọc trong Container dùng palette từ globals.css
    return (
        <main
            className="min-h-screen w-full flex items-center justify-center p-4 bg-blue-50/30 dark:bg-background transition-colors duration-300">
            {/* Lưu ý: Component <Login /> bên trong cũng nên sử dụng các class
         như 'dark:bg-card' hay 'dark:text-foreground' để đồng bộ.
      */}
            <Login onLogin={handleLogin}/>
        </main>
    )
}
