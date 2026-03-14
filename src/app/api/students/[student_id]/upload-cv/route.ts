import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {
  uploadFileServerAction,
  listStudentDocuments,
  deleteFileServerAction,
} from '@/actions/upload';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';
import type { SubscriptionPlan } from '@/lib/api/require-premium';
import { completeCvChecklistTask } from '@/lib/checklist-helper';

function normalizePlan(raw: string | null | undefined): SubscriptionPlan {
  const upper = (raw ?? 'FREE').toString().trim().toUpperCase();
  if (['FREE', 'PLUS', 'PREMIUM'].includes(upper)) return upper as SubscriptionPlan;
  return 'FREE';
}

function getMaxCvSlots(plan: SubscriptionPlan): number {
  switch (plan) {
    case 'FREE': return 2;
    case 'PLUS':
    case 'PREMIUM': return 5;
    default: return 2;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ student_id: string }> }
) {
  try {
    const { student_id } = await params;
    const session = await getServerSession(authOptions);
    const sessionUserId = (session?.user as { id?: string })?.id ?? (session?.user as { user_id?: string })?.user_id;
    if (!sessionUserId || String(sessionUserId) !== String(student_id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = (formData.get('documentType') as string) || 'cv';
    const slotIndexRaw = formData.get('slot_index');

    if (!file) {
      return NextResponse.json(
        { error: 'Không có file được tải lên' },
        { status: 400 }
      );
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Chỉ chấp nhận file PDF, DOC, DOCX hoặc ảnh JPG, PNG, WebP' },
        { status: 400 }
      );
    }

    if (slotIndexRaw != null && slotIndexRaw !== '') {
      const slotIndex = typeof slotIndexRaw === 'string' ? parseInt(slotIndexRaw, 10) : Number(slotIndexRaw);
      const user = await prisma.users.findUnique({
        where: { id: student_id },
        select: { subscription_plan: true },
      });
      const plan = normalizePlan(user?.subscription_plan as string);
      const maxSlots = getMaxCvSlots(plan);
      if (!Number.isInteger(slotIndex) || slotIndex < 1 || slotIndex > maxSlots) {
        return NextResponse.json(
          { error: `slot_index phải từ 1 đến ${maxSlots} theo gói của bạn` },
          { status: 400 }
        );
      }
    }

    const category = documentType === 'certificate' ? 'certificates' : 'cvs';
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('userId', student_id);
    uploadFormData.append('category', category);

    const result = await uploadFileServerAction(uploadFormData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Lỗi khi upload' },
        { status: 500 }
      );
    }

    const fileUrl = result.url!;

    if (slotIndexRaw != null && slotIndexRaw !== '' && documentType === 'cv') {
      const slotIndex = typeof slotIndexRaw === 'string' ? parseInt(slotIndexRaw, 10) : Number(slotIndexRaw);
      const fileName = (file.name || 'document.pdf').slice(0, 255);
      await prisma.student_cv_documents.upsert({
        where: {
          student_id_slot_index: { student_id, slot_index: slotIndex },
        },
        create: {
          id: randomUUID(),
          student_id,
          slot_index: slotIndex,
          file_url: fileUrl,
          file_name: fileName,
        },
        update: {
          file_url: fileUrl,
          file_name: fileName,
          uploaded_at: new Date(),
        },
      });
      const cvCount = await prisma.student_cv_documents.count({ where: { student_id } });
      if (cvCount >= 1) await completeCvChecklistTask(student_id);
    }

    return NextResponse.json({
      success: true,
      fileUrl,
      message:
        documentType === 'certificate'
          ? 'Tải file thành tích lên thành công'
          : 'Upload tài liệu thành công',
    });
  } catch (error) {
    console.error('❌ Error uploading CV:', error);
    return NextResponse.json(
      { error: 'Lỗi khi upload CV' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ student_id: string }> }
) {
  try {
    const { student_id } = await params;
    const documents = await listStudentDocuments(student_id);
    return NextResponse.json(
      documents.map(({ mtime, ...d }) => d)
    );
  } catch (error) {
    console.error('❌ Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách tài liệu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ student_id: string }> }
) {
  try {
    const { student_id } = await params;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Thiếu id tài liệu' },
        { status: 400 }
      );
    }
    // id là full path trong Supabase (e.g. student_id/cvs/123_name.pdf)
    const allowedPrefix = `${student_id}/`;
    if (!id.startsWith(allowedPrefix)) {
      return NextResponse.json(
        { error: 'Tài liệu không tồn tại hoặc không thuộc tài khoản này' },
        { status: 403 }
      );
    }
    const delResult = await deleteFileServerAction(id);
    if (!delResult.success) {
      return NextResponse.json(
        { error: delResult.error || 'Xóa thất bại' },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, message: 'Đã xóa tài liệu' });
  } catch (error) {
    console.error('❌ Error deleting document:', error);
    return NextResponse.json(
      { error: 'Lỗi khi xóa tài liệu' },
      { status: 500 }
    );
  }
}
