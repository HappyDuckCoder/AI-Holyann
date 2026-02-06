import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'

export default async function ChecklistV2Page() {
  // Authentication - Get current session
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Checklist V2
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Checklist version 2 - Coming soon
        </p>
      </div>
    </div>
  )
}
