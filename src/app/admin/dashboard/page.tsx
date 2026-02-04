"use client"
import RoleGuard from '@/components/auth/RoleGuard'
import AdminDashboard from '@/components/admin/dashboard/AdminDashboard'
import AuthHeader from '@/components/auth/AuthHeader'

export default function AdminDashboardPage() {
    return (
        <RoleGuard allowedRoles={['admin', 'ADMIN']}>
            <div
                className="min-h-screen flex flex-col bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
                <AuthHeader/>
                <main className="flex-1 flex items-center justify-center p-4 md:p-8">
                    <AdminDashboard/>
                </main>
            </div>
        </RoleGuard>
    )
}

