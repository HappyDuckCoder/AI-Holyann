import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    // Fetching career recommendations for student

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Missing student_id' },
        { status: 400 }
      );
    }

    // Get career matches from database
    const careerMatches = await prisma.career_matches.findMany({
      where: { student_id: studentId },
      orderBy: { match_percentage: 'desc' },
      take: 10,
    });

    if (careerMatches.length === 0) {
      return NextResponse.json({
        success: true,
        recommendations: [],
        message: 'No career recommendations found. Complete all tests first.',
      });
    }

    const recommendations = careerMatches.map(match => ({
      job_title: match.job_title,
      match_percentage: match.match_percentage,
      reasoning: match.reasoning || 'Based on your test results',
      created_at: match.created_at,
    }));

    // Found career recommendations

    return NextResponse.json({
      success: true,
      recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    console.error('❌ Error fetching career recommendations:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
