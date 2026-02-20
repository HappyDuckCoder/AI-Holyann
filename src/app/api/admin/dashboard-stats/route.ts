import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/dashboard-stats
 * Thống kê dashboard admin: total users, students, mentors, admins, active assignments, new users 7 days.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [totalUsers, students, mentors, admins, activeAssignments, newUsersLast7Days] =
      await Promise.all([
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
      ]);

    return NextResponse.json({
      totalUsers,
      students,
      mentors,
      admins,
      activeAssignments,
      newUsersLast7Days,
    });
  } catch (error) {
    console.error('[admin/dashboard-stats]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
