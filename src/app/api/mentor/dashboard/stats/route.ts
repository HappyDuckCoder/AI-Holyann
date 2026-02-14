import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { getMentorDashboardStats } from '@/actions/mentor';

/**
 * GET /api/mentor/dashboard/stats
 * Lấy thống kê cho dashboard mentor
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mentorId = session.user.id;
    if (!mentorId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    // Sử dụng server action để lấy thống kê
    const stats = await getMentorDashboardStats(mentorId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
