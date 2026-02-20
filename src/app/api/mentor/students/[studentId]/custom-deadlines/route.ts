import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';

async function ensureMentorAccess(mentorId: string, studentId: string) {
  const assignment = await prisma.mentor_assignments.findFirst({
    where: { mentor_id: mentorId, student_id: studentId },
  });
  if (!assignment) return null;
  return assignment;
}

/**
 * GET /api/mentor/students/[studentId]/custom-deadlines
 * Danh sách custom deadlines do mentor tạo cho học viên
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { studentId } = await params;
    const assignment = await ensureMentorAccess(session.user.id, studentId);
    if (!assignment) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const list = await prisma.mentor_custom_deadlines.findMany({
      where: { student_id: studentId, mentor_id: session.user.id },
      orderBy: [{ deadline: 'asc' }, { created_at: 'desc' }],
    });

    const data = list.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? null,
      mentor_note: row.mentor_note ?? null,
      student_note: row.student_note ?? null,
      deadline: row.deadline?.toISOString() ?? null,
      status: row.status,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
    }));

    return NextResponse.json(data);
  } catch (e) {
    console.error('GET custom-deadlines:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/mentor/students/[studentId]/custom-deadlines
 * Tạo custom deadline mới
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { studentId } = await params;
    const assignment = await ensureMentorAccess(session.user.id, studentId);
    if (!assignment) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }
    const description =
      typeof body.description === 'string' ? body.description.trim() || null : null;
    const deadline =
      body.deadline != null && body.deadline !== ''
        ? new Date(body.deadline)
        : null;
    if (deadline != null && isNaN(deadline.getTime())) {
      return NextResponse.json({ error: 'Invalid deadline date' }, { status: 400 });
    }

    const created = await prisma.mentor_custom_deadlines.create({
      data: {
        student_id: studentId,
        mentor_id: session.user.id,
        title,
        description,
        deadline,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      id: created.id,
      title: created.title,
      description: created.description ?? null,
      mentor_note: created.mentor_note ?? null,
      student_note: created.student_note ?? null,
      deadline: created.deadline?.toISOString() ?? null,
      status: created.status,
      created_at: created.created_at.toISOString(),
      updated_at: created.updated_at.toISOString(),
    });
  } catch (e) {
    console.error('POST custom-deadlines:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
