"use client"
import { use } from 'react'
import RoleGuard from '@/components/auth/RoleGuard'
import { StudentDetail } from '@/components/admin'

interface StudentDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function StudentDetailPage({ params }: StudentDetailPageProps) {
    const { id } = use(params)

    return (
        <RoleGuard allowedRoles={['admin', 'ADMIN']}>
            <div className="max-w-6xl mx-auto">
                <div className="bg-card border border-border rounded-xl shadow-sm p-6 md:p-8">
                    <StudentDetail studentId={id} />
                </div>
            </div>
        </RoleGuard>
    )
}
