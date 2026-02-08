import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

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

        // Chỉ cho phép một CV: nếu đã có CV rồi thì không cho tải thêm
        if (documentType === 'cv') {
            const cvsDir = path.join(process.cwd(), 'public', 'uploads', 'cvs');
            if (existsSync(cvsDir)) {
                const fs = await import('fs');
                const names = fs.readdirSync(cvsDir);
                const hasCv = names.some((name) => name.startsWith(`cv_${student_id}_`));
                if (hasCv) {
                    return NextResponse.json(
                        { error: 'Bạn đã tải CV lên rồi. Không thể tải thêm.' },
                        { status: 400 }
                    );
                }
            }
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

        const subdir = documentType === 'certificate' ? 'certificates' : 'cvs';
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', subdir);
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const timestamp = Date.now();
        const extension = path.extname(file.name);
        const prefix = documentType === 'certificate' ? 'cert' : 'cv';
        const fileName = `${prefix}_${student_id}_${timestamp}${extension}`;
        const filePath = path.join(uploadDir, fileName);

        // Lưu file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        const fileUrl = `/uploads/${subdir}/${fileName}`;

        // TODO: Xử lý extract thông tin từ CV bằng AI
        // Có thể sử dụng các dịch vụ như:
        // - OpenAI GPT-4 Vision
        // - Google Document AI
        // - Azure Form Recognizer
        // - Custom CV parser

        return NextResponse.json({
            success: true,
            fileUrl,
            message: documentType === 'certificate' ? 'Tải file thành tích lên thành công' : 'Upload tài liệu thành công',
        });
    } catch (error) {
        console.error('❌ Error uploading CV:', error);
        return NextResponse.json(
            { error: 'Lỗi khi upload CV' },
            { status: 500 }
        );
    }
}

type DocumentType = 'transcript' | 'certificate' | 'letter' | 'essay' | 'other';

interface DocItem {
  id: string;
  name: string;
  type: DocumentType;
  uploadDate: string;
  size: string;
  mtime: number;
}

function listDirDocs(
  fs: typeof import('fs'),
  dir: string,
  studentId: string,
  prefix: string,
  docType: DocumentType
): DocItem[] {
  if (!existsSync(dir)) return [];
  const files = fs.readdirSync(dir);
  return files
    .filter((f: string) => f.startsWith(`${prefix}_${studentId}_`))
    .map((file: string) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      const sizeKB = Math.round(stat.size / 1024);
      const sizeStr = sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
      return {
        id: file,
        name: file,
        type: docType,
        uploadDate: stat.mtime.toLocaleDateString('vi-VN'),
        size: sizeStr,
        mtime: stat.mtime.getTime(),
      };
    })
    .sort((a, b) => b.mtime - a.mtime);
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ student_id: string }> }
) {
    try {
        const { student_id } = await params;
        const fs = require('fs');
        const base = path.join(process.cwd(), 'public', 'uploads');

        const cvs = listDirDocs(
          fs,
          path.join(base, 'cvs'),
          student_id,
          'cv',
          'transcript'
        );
        const certs = listDirDocs(
          fs,
          path.join(base, 'certificates'),
          student_id,
          'cert',
          'certificate'
        );

        const combined: DocItem[] = [...cvs, ...certs];
        combined.sort((a, b) => b.mtime - a.mtime);
        const documents = combined.map(({ mtime, ...d }) => d);
        return NextResponse.json(documents);
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
        const base = path.join(process.cwd(), 'public', 'uploads');
        const inCvs = id.startsWith('cv_') && id.includes(`_${student_id}_`);
        const inCerts = id.startsWith('cert_') && id.includes(`_${student_id}_`);
        if (!inCvs && !inCerts) {
            return NextResponse.json(
                { error: 'Tài liệu không tồn tại hoặc không thuộc tài khoản này' },
                { status: 403 }
            );
        }
        const subdir = inCerts ? 'certificates' : 'cvs';
        const filePath = path.join(base, subdir, id);
        if (!existsSync(filePath)) {
            return NextResponse.json(
                { error: 'File không tồn tại' },
                { status: 404 }
            );
        }
        await unlink(filePath);
        return NextResponse.json({ success: true, message: 'Đã xóa tài liệu' });
    } catch (error) {
        console.error('❌ Error deleting document:', error);
        return NextResponse.json(
            { error: 'Lỗi khi xóa tài liệu' },
            { status: 500 }
        );
    }
}
