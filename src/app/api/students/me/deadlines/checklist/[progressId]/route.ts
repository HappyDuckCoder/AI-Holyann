import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';

const ALLOWED_STUDENT_STATUS = 'SUBMITTED' as const;

/**
 * PATCH /api/students/me/deadlines/checklist/[progressId]
 * Học viên cập nhật ghi chú và/hoặc nộp review (chuyển trạng thái sang SUBMITTED)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ progressId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const studentId = session.user.id;
    const { progressId } = await params;

    const body = await request.json().catch(() => ({}));
    const student_note = typeof body.student_note === 'string' ? body.student_note.trim() || null : undefined;
    const status = body.status === ALLOWED_STUDENT_STATUS ? ALLOWED_STUDENT_STATUS : undefined;

    const progress = await prisma.student_task_progress.findFirst({
      where: { id: progressId, student_id: studentId },
    });
    if (!progress) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const data: { student_note?: string | null; status?: typeof ALLOWED_STUDENT_STATUS } = {};
    if (student_note !== undefined) data.student_note = student_note;
    if (status !== undefined) data.status = status;

    const updated = await prisma.student_task_progress.update({
      where: { id: progressId },
      data,
    });

    return NextResponse.json({
      id: updated.id,
      student_note: updated.student_note ?? null,
      status: updated.status,
    });
  } catch (e) {
    console.error('PATCH checklist deadline:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
