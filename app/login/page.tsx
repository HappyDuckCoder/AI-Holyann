'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Login from '@/components/Login'
import Loading from '@/components/Loading'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  const handleLogin = (email: string, name: string) => {
    login(email, name)
    router.push('/')
  }

  if (isAuthenticated) {
    return <Loading />
  }

  return <Login onLogin={handleLogin} />
}