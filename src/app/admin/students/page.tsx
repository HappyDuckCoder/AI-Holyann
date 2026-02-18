"use client"
import RoleGuard from '@/components/auth/RoleGuard'
import { StudentManagement } from '@/components/admin'

export default function AdminStudentsPage() {
    return (
        <RoleGuard allowedRoles={['admin', 'ADMIN']}>
            <div className="bg-card/50 dark:bg-card/20 shadow-lg rounded-2xl overflow-hidden p-6">
                <StudentManagement />
            </div>
        </RoleGuard>
    )
}
