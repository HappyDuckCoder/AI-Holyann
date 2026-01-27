import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/students
 * Lấy danh sách students cho admin
 */
export async function GET(request: NextRequest) {
    try {
        const students = await prisma.users.findMany({
            where: {
                role: 'STUDENT'
            },
            select: {
                id: true,
                full_name: true,
                email: true,
                is_active: true,
                avatar_url: true,
                created_at: true
            },
            orderBy: {
                created_at: 'desc'
            }
        })

        // Transform data to match expected format
        const formattedStudents = students.map(student => ({
            id: student.id,
            name: student.full_name,
            email: student.email,
            isActive: student.is_active,
            avatarUrl: student.avatar_url,
            createdAt: student.created_at
        }))

        return NextResponse.json({ 
            students: formattedStudents,
            count: formattedStudents.length 
        })
        
    } catch (error) {
        console.error('Error fetching students:', error)
        return NextResponse.json(
            { message: 'Lỗi khi lấy danh sách học viên', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}