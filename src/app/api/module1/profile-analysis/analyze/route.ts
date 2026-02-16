/**
 * Profile Analysis API - Analyze and Save
 *
 * POST /api/module1/profile-analysis/analyze
 *
 * Phân tích hồ sơ student và lưu kết quả vào database
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { analyzeAndSaveProfile, buildAnalysisPayloadFromStudent } from '@/services/profile-analysis.service';

export async function POST(request: NextRequest) {
  try {
    // Lấy session để xác thực user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Vui lòng đăng nhập', success: false },
        { status: 401 }
      );
    }

    const body = await request.json();

    // student_id có thể được truyền vào hoặc lấy từ session
    const studentId = body.student_id || session.user.id;

    // Kiểm tra quyền (chỉ chính student hoặc admin mới được phân tích)
    if (studentId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Không có quyền truy cập', success: false },
        { status: 403 }
      );
    }

    // customPayload nếu user muốn override data từ database
    const customPayload = body.payload || null;

    // Phân tích và lưu
    const result = await analyzeAndSaveProfile(studentId, customPayload);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'Lỗi khi phân tích hồ sơ',
          success: false
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Phân tích hồ sơ thành công',
      data: result.data,
      analysisId: result.analysisId,
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ [Profile Analysis API - Analyze] Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Lỗi server khi phân tích hồ sơ',
        success: false,
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Preview payload mà sẽ được gửi đến AI
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('student_id') || session.user.id;

    // Kiểm tra quyền
    if (studentId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden', success: false },
        { status: 403 }
      );
    }

    const payload = await buildAnalysisPayloadFromStudent(studentId);

    return NextResponse.json({
      success: true,
      payload,
      message: 'Đây là dữ liệu sẽ được gửi đến AI để phân tích',
    });

  } catch (error: any) {
    console.error('❌ [Profile Analysis API - Preview] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi khi tạo preview', success: false },
      { status: 500 }
    );
  }
}
