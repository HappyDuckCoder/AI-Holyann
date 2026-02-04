import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { testType: string; studentId: string } }
) {
  try {
    const { testType, studentId } = params;
    console.log(`🗑️ Resetting ${testType.toUpperCase()} test for student:`, studentId);

    if (!testType || !studentId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const testTypeLower = testType.toLowerCase();

    // Delete test based on type
    if (testTypeLower === 'mbti') {
      await prisma.mbti_tests.deleteMany({
        where: { student_id: studentId },
      });
    } else if (testTypeLower === 'grit') {
      await prisma.grit_tests.deleteMany({
        where: { student_id: studentId },
      });
    } else if (testTypeLower === 'riasec') {
      await prisma.riasec_tests.deleteMany({
        where: { student_id: studentId },
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid test type' },
        { status: 400 }
      );
    }

    console.log(`✅ ${testType.toUpperCase()} test reset successfully`);

    return NextResponse.json({
      success: true,
      message: `${testType.toUpperCase()} test reset successfully`,
    });
  } catch (error) {
    console.error('❌ Error resetting test:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { testType: string; studentId: string } }
) {
  try {
    const { testType, studentId } = params;
    console.log(`📖 Getting ${testType.toUpperCase()} test result for student:`, studentId);

    const testTypeLower = testType.toLowerCase();
    let test = null;

    if (testTypeLower === 'mbti') {
      test = await prisma.mbti_tests.findUnique({
        where: { student_id: studentId },
      });
    } else if (testTypeLower === 'grit') {
      test = await prisma.grit_tests.findUnique({
        where: { student_id: studentId },
      });
    } else if (testTypeLower === 'riasec') {
      test = await prisma.riasec_tests.findUnique({
        where: { student_id: studentId },
      });
    }

    if (!test) {
      return NextResponse.json({
        success: true,
        test_exists: false,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      test_exists: true,
      data: test,
    });
  } catch (error) {
    console.error('❌ Error getting test result:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
