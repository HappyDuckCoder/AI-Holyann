"use client"
import RoleGuard from '@/components/auth/RoleGuard'
import UserManagement from '@/components/admin/UserManagement'

export default function AdminUsersPage() {
    return (
        <RoleGuard allowedRoles={['admin', 'ADMIN']}>
            <UserManagement />
        </RoleGuard>
    )
}
