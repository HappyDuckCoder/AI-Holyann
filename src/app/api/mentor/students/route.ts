import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/mentor/students
 * Lấy danh sách học viên được gán cho mentor
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mentorId = session.user.id;

    // Lấy danh sách assignments với thông tin học viên
    const assignments = await prisma.mentor_assignments.findMany({
      where: {
        mentor_id: mentorId,
        status: 'ACTIVE',
      },
      include: {
        student: {
          include: {
            users: {
              select: {
                full_name: true,
                email: true,
                avatar_url: true,
                phone_number: true,
              },
            },
          },
        },
      },
      orderBy: {
        assigned_at: 'desc',
      },
    });

    // Transform data để phù hợp với frontend
    const students = assignments.map((assignment) => ({
      student_id: assignment.student_id,
      assignment_id: assignment.id,
      type: assignment.type,
      status: assignment.status,
      student: {
        full_name: assignment.student.users.full_name,
        email: assignment.student.users.email,
        avatar_url: assignment.student.users.avatar_url,
        phone_number: assignment.student.users.phone_number,
      },
      progress: 0, // TODO: Calculate actual progress from tasks
    }));

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching assigned students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
