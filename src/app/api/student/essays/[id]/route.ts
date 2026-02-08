/**
 * GET   /api/student/essays/[id] — Chi tiết một essay (student sở hữu).
 * PATCH /api/student/essays/[id] — Cập nhật essay (student sở hữu).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const studentId = session.user.id;
    const { id } = await params;

    const essay = await prisma.essays.findFirst({
      where: { id, student_id: studentId },
      include: {
        comments: {
          orderBy: { created_at: 'asc' },
          include: {
            author: {
              select: { id: true, full_name: true, email: true },
            },
          },
        },
      },
    });

    if (!essay) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy bài luận' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: essay });
  } catch (error) {
    console.error('❌ [student/essays/[id] GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Lỗi khi lấy bài luận' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const studentId = session.user.id;
    const { id } = await params;

    const essay = await prisma.essays.findFirst({
      where: { id, student_id: studentId },
    });
    if (!essay) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy bài luận' }, { status: 404 });
    }

    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title : undefined;
    const content = typeof body.content === 'string' ? body.content : undefined;

    const updated = await prisma.essays.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title || null }),
        ...(content !== undefined && { content }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('❌ [student/essays/[id] PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Lỗi khi cập nhật bài luận' },
      { status: 500 }
    );
  }
}
