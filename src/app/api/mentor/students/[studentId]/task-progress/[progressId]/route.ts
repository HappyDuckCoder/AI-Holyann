import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';

async function ensureMentorAccess(mentorId: string, studentId: string) {
  const assignment = await prisma.mentor_assignments.findFirst({
    where: { mentor_id: mentorId, student_id: studentId, status: 'ACTIVE' },
  });
  return !!assignment;
}

/**
 * PATCH /api/mentor/students/[studentId]/task-progress/[progressId]
 * Mentor cập nhật ghi chú (mentor_note) cho tiến độ checklist của học viên
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ studentId: string; progressId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { studentId, progressId } = await params;
    const hasAccess = await ensureMentorAccess(session.user.id, studentId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const mentor_note = typeof body.mentor_note === 'string' ? body.mentor_note.trim() || null : null;

    const progress = await prisma.student_task_progress.findFirst({
      where: { id: progressId, student_id: studentId },
    });
    if (!progress) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updated = await prisma.student_task_progress.update({
      where: { id: progressId },
      data: { mentor_note },
    });

    return NextResponse.json({
      id: updated.id,
      mentor_note: updated.mentor_note ?? null,
    });
  } catch (e) {
    console.error('PATCH task-progress mentor_note:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
