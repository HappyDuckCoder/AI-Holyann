/**
 * GET /api/universities/[id]
 * Public API – chi tiết một trường QS (schema: university_rankings).
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    const numId = parseInt(id, 10);
    if (Number.isNaN(numId)) {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }

    const university = await prisma.university_rankings.findUnique({
      where: { id: numId },
      select: {
        id: true,
        qs_rank: true,
        name: true,
        country: true,
        country_code: true,
        city: true,
        region: true,
        type: true,
        founded_year: true,
        total_students: true,
        website: true,
        qs_overall_score: true,
        academic_reputation: true,
        employer_reputation: true,
        faculty_student_ratio: true,
        citations_per_faculty: true,
        international_faculty: true,
        international_students: true,
        strong_subjects: true,
        description: true,
      },
    });

    if (!university) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, university });
  } catch (error) {
    console.error('❌ [GET /api/universities/[id]] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải thông tin trường' },
      { status: 500 }
    );
  }
}
