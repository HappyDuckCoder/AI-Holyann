import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { getMentorStudents } from '@/actions/mentor';

/**
 * GET /api/mentor/students
 * Lấy danh sách học viên được gán cho mentor với tính toán progress chính xác
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

    // Sử dụng server action để lấy danh sách học viên với progress được tính toán
    const students = await getMentorStudents(mentorId);

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching assigned students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
