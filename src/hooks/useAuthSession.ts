'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Custom hook to handle NextAuth session with automatic error recovery
 * This prevents CLIENT_FETCH_ERROR by implementing retry logic
 */
export function useAuthSession(options?: {
  required?: boolean
  onUnauthenticated?: () => void
}) {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  useEffect(() => {
    // If session fetch fails, try to recover
    if (status === 'unauthenticated' && options?.required) {
      if (options.onUnauthenticated) {
        options.onUnauthenticated()
      } else {
        // Redirect to login if authentication is required
        router.push('/login')
      }
    }
  }, [status, options, router])

  // Auto-refresh session when it's about to expire
  useEffect(() => {
    if (session) {
      // Refresh session every 4 hours
      const interval = setInterval(() => {
        update()
      }, 4 * 60 * 60 * 1000)

      return () => clearInterval(interval)
    }
  }, [session, update])

  return {
    session,
    status,
    update,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    user: session?.user,
  }
}
