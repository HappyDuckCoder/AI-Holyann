"use client"
import RoleGuard from '@/components/auth/RoleGuard'
import { StudentManagement } from '@/components/admin'

export default function AdminStudentsPage() {
    return (
        <RoleGuard allowedRoles={['admin', 'ADMIN']}>
            <StudentManagement />
        </RoleGuard>
    )
}
