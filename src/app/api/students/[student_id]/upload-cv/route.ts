import { NextRequest, NextResponse } from 'next/server';
import {
  uploadFileServerAction,
  listStudentDocuments,
  deleteFileServerAction,
} from '@/actions/upload';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ student_id: string }> }
) {
  try {
    const { student_id } = await params;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = (formData.get('documentType') as string) || 'cv';

    if (!file) {
      return NextResponse.json(
        { error: 'Không có file được tải lên' },
        { status: 400 }
      );
    }

    // Giới hạn "chỉ một CV" được kiểm tra ở frontend (trang Improve). Checklist có thể upload nhiều tài liệu (transcript, CV, ...) nên API không chặn tại đây.

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
