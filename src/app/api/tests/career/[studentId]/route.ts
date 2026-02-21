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

    // Get career matches from database (chỉ đọc DB, không gọi server-AI)
    const careerMatches = await prisma.career_matches.findMany({
      where: { student_id: studentId },
      orderBy: { match_percentage: 'desc' },
      take: 20,
    });

    if (careerMatches.length === 0) {
      return NextResponse.json({
        success: true,
        recommendations: [],
        career_groups: null,
        message: 'No career recommendations found.',
      });
    }

    const recommendations = careerMatches.map(match => ({
      job_title: match.job_title,
      job_field: match.job_field ?? undefined,
      match_percentage: match.match_percentage,
      reasoning: match.reasoning || 'Dựa trên kết quả test của bạn',
      created_at: match.created_at,
    }));

    // Nhóm theo job_field để trả career_groups (giống format module2)
    const byGroup = new Map<string, typeof recommendations>();
    for (const rec of recommendations) {
      const group = rec.job_field || 'Khác';
      if (!byGroup.has(group)) byGroup.set(group, []);
      byGroup.get(group)!.push(rec);
    }
    const career_groups = Object.fromEntries(byGroup);

    return NextResponse.json({
      success: true,
      recommendations,
      career_groups,
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
