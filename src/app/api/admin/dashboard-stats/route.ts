import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/dashboard-stats
 * Returns counts for admin dashboard: users by role, assignments, recent growth.
 */
export async function GET() {
    try {
        const [
            totalUsers,
            studentsCount,
            mentorsCount,
            adminsCount,
            activeAssignments,
            newUsersLast7Days,
        ] = await Promise.all([
            prisma.users.count(),
            prisma.users.count({ where: { role: 'STUDENT' } }),
            prisma.users.count({ where: { role: 'MENTOR' } }),
            prisma.users.count({ where: { role: 'ADMIN' } }),
            prisma.mentor_assignments.count({ where: { status: 'ACTIVE' } }),
            prisma.users.count({
                where: {
                    created_at: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
        ])

        return NextResponse.json({
            totalUsers,
            students: studentsCount,
            mentors: mentorsCount,
            admins: adminsCount,
            activeAssignments,
            newUsersLast7Days,
        })
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        return NextResponse.json(
            { message: 'Failed to load stats' },
            { status: 500 }
        )
    }
}
