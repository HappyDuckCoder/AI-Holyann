import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';

async function ensureMentorOwnership(mentorId: string, studentId: string, recordId: string) {
  const record = await prisma.mentor_custom_deadlines.findUnique({
    where: { id: recordId },
  });
  if (!record || record.student_id !== studentId || record.mentor_id !== mentorId) return null;
  return record;
}

/**
 * PATCH /api/mentor/students/[studentId]/custom-deadlines/[id]
 * Cập nhật custom deadline (title, description, deadline, status)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ studentId: string; id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { studentId, id: recordId } = await params;
    const existing = await ensureMentorOwnership(session.user.id, studentId, recordId);
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const data: {
      title?: string;
      description?: string | null;
      mentor_note?: string | null;
      student_note?: string | null;
      deadline?: Date | null;
      status?: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED' | 'NEEDS_REVISION';
    } = {};

    if (typeof body.title === 'string') {
      const t = body.title.trim();
      if (t) data.title = t;
    }
    if (body.description !== undefined) {
      data.description = typeof body.description === 'string' ? body.description.trim() || null : null;
    }
    if (body.mentor_note !== undefined) {
      data.mentor_note = typeof body.mentor_note === 'string' ? body.mentor_note.trim() || null : null;
    }
    if (body.student_note !== undefined) {
      data.student_note = typeof body.student_note === 'string' ? body.student_note.trim() || null : null;
    }
    if (body.deadline !== undefined) {
      data.deadline = body.deadline == null || body.deadline === '' ? null : new Date(body.deadline);
      if (data.deadline != null && isNaN(data.deadline.getTime())) {
        return NextResponse.json({ error: 'Invalid deadline date' }, { status: 400 });
      }
    }
    if (['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'NEEDS_REVISION'].includes(body.status)) {
      data.status = body.status;
    }

    const updated = await prisma.mentor_custom_deadlines.update({
      where: { id: recordId },
      data,
    });

    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      description: updated.description ?? null,
      mentor_note: updated.mentor_note ?? null,
      student_note: updated.student_note ?? null,
      deadline: updated.deadline?.toISOString() ?? null,
      status: updated.status,
      created_at: updated.created_at.toISOString(),
      updated_at: updated.updated_at.toISOString(),
    });
  } catch (e) {
    console.error('PATCH custom-deadlines:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/mentor/students/[studentId]/custom-deadlines/[id]
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ studentId: string; id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { studentId, id: recordId } = await params;
    const existing = await ensureMentorOwnership(session.user.id, studentId, recordId);
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.mentor_custom_deadlines.delete({ where: { id: recordId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('DELETE custom-deadlines:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
