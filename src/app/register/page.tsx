'use client'
import {useEffect} from 'react'
import {useAuth} from '@/contexts/AuthContext'
import {useRouter} from 'next/navigation'
import Loading from '@/components/dashboard/Loading'
import Register from '@/components/dashboard/Register'

export default function RegisterPage() {
    const {login, isAuthenticated} = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard')
        }
    }, [isAuthenticated, router])

    if (isAuthenticated) {
        return <Loading/>
    }

    const handleRegister = (email: string, name: string) => {
        login(email, name)
        router.push('/dashboard')
    }

    return (
        <main
            className="min-h-screen w-full flex items-center justify-center p-4 bg-blue-50/30 dark:bg-background transition-colors duration-300">
            <Register onRegister={handleRegister}/>
        </main>
    )
}
