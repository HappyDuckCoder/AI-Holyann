"use client"
import RoleGuard from '@/components/auth/RoleGuard'
import MentorDashboard from '@/components/dashboard/MentorDashboard'
import AuthHeader from '@/components/dashboard/AuthHeader'

export default function MentorPage() {
    return (
        <RoleGuard allowedRoles={['mentor', 'admin']}>
            <div
                className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
                <AuthHeader/>
                <main className="flex-1 flex items-center justify-center p-4 md:p-8">
                    <MentorDashboard/>
                </main>
            </div>
        </RoleGuard>
    )
}

