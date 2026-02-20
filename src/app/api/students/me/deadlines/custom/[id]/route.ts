import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';

const ALLOWED_STUDENT_STATUS = 'SUBMITTED' as const;

/**
 * PATCH /api/students/me/deadlines/custom/[id]
 * Học viên cập nhật ghi chú và/hoặc chuyển trạng thái sang Chờ review (SUBMITTED)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const studentId = session.user.id;
    const { id: recordId } = await params;

    const body = await request.json().catch(() => ({}));
    const student_note = typeof body.student_note === 'string' ? body.student_note.trim() || null : undefined;
    const status = body.status === ALLOWED_STUDENT_STATUS ? ALLOWED_STUDENT_STATUS : undefined;

    const record = await prisma.mentor_custom_deadlines.findFirst({
      where: { id: recordId, student_id: studentId },
    });
    if (!record) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const data: { student_note?: string | null; status?: typeof ALLOWED_STUDENT_STATUS } = {};
    if (student_note !== undefined) data.student_note = student_note;
    if (status !== undefined) data.status = status;

    const updated = await prisma.mentor_custom_deadlines.update({
      where: { id: recordId },
      data,
    });

    return NextResponse.json({
      id: updated.id,
      student_note: updated.student_note ?? null,
      status: updated.status,
    });
  } catch (e) {
    console.error('PATCH custom deadline:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
