import { NextResponse } from 'next/server';
import { getStudentChecklist } from '@/actions/mentor-checklist';

/**
 * GET /api/mentor/student/[id]/checklist
 * Test endpoint để lấy checklist của học viên
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;

    console.log('🔍 API: Getting checklist for student:', studentId);

    const result = await getStudentChecklist(studentId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
