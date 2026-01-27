/**
 * EXAMPLE: Cách sử dụng useAuthSession thay cho useSession
 *
 * File này là ví dụ, không cần import vào app.
 * Chỉ cần tham khảo khi viết component mới.
 */

'use client'

import { useAuthSession } from '@/hooks/useAuthSession'
import { useRouter } from 'next/navigation'

// ✅ EXAMPLE 1: Protected Page - Tự động redirect
export function ProtectedPageExample() {
  const { session, isLoading } = useAuthSession({
    required: true // Tự động redirect về /login nếu chưa auth
  })

  if (isLoading) {
    return <div>Đang kiểm tra phiên đăng nhập...</div>
  }

  return (
    <div>
      <h1>Welcome {session?.user?.name}!</h1>
      <p>Email: {session?.user?.email}</p>
      <p>Role: {session?.user?.role}</p>
    </div>
  )
}

// ✅ EXAMPLE 2: Custom redirect handler
export function CustomRedirectExample() {
  const router = useRouter()
  const { session, isAuthenticated } = useAuthSession({
    required: true,
    onUnauthenticated: () => {
      // Custom logic trước khi redirect
      console.log('User not authenticated, redirecting...')
      router.push('/login?reason=session_expired')
    }
  })

  if (!isAuthenticated) return null

  return <div>Protected content here</div>
}

// ✅ EXAMPLE 3: Optional authentication
export function OptionalAuthExample() {
  const { session, isAuthenticated, isLoading } = useAuthSession()

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Chào {session?.user?.name}!</p>
          <button>Xem hồ sơ</button>
        </div>
      ) : (
        <div>
          <p>Bạn chưa đăng nhập</p>
          <button>Đăng nhập ngay</button>
        </div>
      )}
    </div>
  )
}

// ✅ EXAMPLE 4: Force refresh session
export function RefreshSessionExample() {
  const { session, update } = useAuthSession()

  const handleRefresh = async () => {
    await update() // Force refetch session from server
    console.log('Session refreshed!')
  }

  return (
    <div>
      <p>User: {session?.user?.email}</p>
      <button onClick={handleRefresh}>
        Refresh Session
      </button>
    </div>
  )
}

// ✅ EXAMPLE 5: Role-based access
export function RoleBasedExample() {
  const { session, isLoading } = useAuthSession({ required: true })

  if (isLoading) return <div>Loading...</div>

  const role = session?.user?.role

  return (
    <div>
      {role === 'admin' && <AdminPanel />}
      {role === 'mentor' && <MentorDashboard />}
      {role === 'student' && <StudentDashboard />}
    </div>
  )
}

// ❌ WRONG WAY - Không nên dùng như này nữa
export function OldWayExample() {
  // DEPRECATED: Dễ bị CLIENT_FETCH_ERROR
  // const { data: session } = useSession()

  // ✅ BETTER: Dùng useAuthSession
  const { session } = useAuthSession()

  return <div>User: {session?.user?.email}</div>
}

// Placeholder components
function AdminPanel() { return <div>Admin Panel</div> }
function MentorDashboard() { return <div>Mentor Dashboard</div> }
function StudentDashboard() { return <div>Student Dashboard</div> }
