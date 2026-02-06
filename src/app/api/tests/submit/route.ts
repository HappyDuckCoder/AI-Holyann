import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TestStatus, TaskStatus } from '@prisma/client';
import { autoCompleteChecklistTask } from '@/lib/checklist-helper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { test_id, student_id, test_type, answers, results } = body;

    // Submitting test answers for user

    // Validate input
    if (!test_id || !student_id || !test_type || !answers) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: test_id, student_id, test_type, answers' },
        { status: 400 }
      );
    }

    const testType = test_type.toLowerCase();

    // Verify ownership and existence
    let existingTest = null;
    if (testType === 'mbti') {
        existingTest = await prisma.mbti_tests.findUnique({ where: { id: test_id } });
    } else if (testType === 'grit') {
        existingTest = await prisma.grit_tests.findUnique({ where: { id: test_id } });
    } else if (testType === 'riasec') {
        existingTest = await prisma.riasec_tests.findUnique({ where: { id: test_id } });
    }

    if (!existingTest) {
        return NextResponse.json({ success: false, error: 'Test not found' }, { status: 404 });
    }

    if (existingTest.student_id !== student_id) {
        return NextResponse.json({ success: false, error: 'Unauthorized: Test does not belong to user' }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {
      answers: answers,
      status: TestStatus.COMPLETED,
      completed_at: new Date(),
      updated_at: new Date(),
    };

    // Add results if provided
    if (results) {
       if (testType === 'mbti') {
          updateData.result_type = results.type || (existingTest as any).result_type;
          updateData.score_e = results.scores?.['E/I']?.E ?? null;
          updateData.score_i = results.scores?.['E/I']?.I ?? null;
          updateData.score_s = results.scores?.['S/N']?.S ?? null;
          updateData.score_n = results.scores?.['S/N']?.N ?? null;
          updateData.score_t = results.scores?.['T/F']?.T ?? null;
          updateData.score_f = results.scores?.['T/F']?.F ?? null;
          updateData.score_j = results.scores?.['J/P']?.J ?? null;
          updateData.score_p = results.scores?.['J/P']?.P ?? null;
       } else if (testType === 'grit') {
          updateData.passion_score = results.passion_score ?? null;
          updateData.perseverance_score = results.perseverance_score ?? null;
          updateData.total_score = results.overall_grit_score ?? null;
          updateData.level = results.level ?? null;
       } else if (testType === 'riasec') {
          updateData.score_realistic = results.scores?.R ?? null;
          updateData.score_investigative = results.scores?.I ?? null;
          updateData.score_artistic = results.scores?.A ?? null;
          updateData.score_social = results.scores?.S ?? null;
          updateData.score_enterprising = results.scores?.E ?? null;
          updateData.score_conventional = results.scores?.C ?? null;
          updateData.result_code = results.code ?? null;
       }
    }

    // Update answers & status in database
    if (testType === 'mbti') {
      await prisma.mbti_tests.update({ where: { id: test_id }, data: updateData });
    } else if (testType === 'grit') {
      await prisma.grit_tests.update({ where: { id: test_id }, data: updateData });
    } else if (testType === 'riasec') {
      await prisma.riasec_tests.update({ where: { id: test_id }, data: updateData });
    }

    // Test answers saved and status set to COMPLETED

    // --- Checklist Linking Logic (Refactored) ---
    // Sử dụng helper function để tìm task dựa trên keyword trong link (mbti, grit, riasec)
    // Điều này linh hoạt hơn so với tìm theo Title chính xác
    if (testType === 'mbti' || testType === 'grit' || testType === 'riasec') {
      await autoCompleteChecklistTask(student_id, testType); // testType khớp với keyword trong path helper
    }

    return NextResponse.json({
      success: true,
      message: 'Test submitted and completed successfully',
      result: { test_id, answers_count: Object.keys(answers).length },
    });

  } catch (error) {
    console.error('❌ Error saving test answers:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
