"use client"
import RoleGuard from '@/components/auth/RoleGuard'
import UserManagement from '@/components/admin/UserManagement'

export default function AdminUsersPage() {
    return (
        <RoleGuard allowedRoles={['admin', 'ADMIN']}>
            <div className="bg-card/50 dark:bg-card/20 shadow-lg rounded-2xl overflow-hidden p-6">
                <UserManagement />
            </div>
        </RoleGuard>
    )
}
