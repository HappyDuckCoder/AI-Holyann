import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { prisma } from '@/lib/prisma';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ student_id: string }> }
) {
  try {
    const { student_id } = await params;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Không có file ảnh được tải lên' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Chỉ chấp nhận ảnh JPG, PNG, WebP hoặc GIF' },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name) || '.jpg';
    const fileName = `avatar_${student_id}_${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const fileUrl = `/uploads/avatars/${fileName}`;

    await prisma.users.update({
      where: { id: student_id },
      data: { avatar_url: fileUrl },
    });

    return NextResponse.json({
      success: true,
      avatarUrl: fileUrl,
      message: 'Cập nhật ảnh đại diện thành công',
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tải ảnh lên' },
      { status: 500 }
    );
  }
}
