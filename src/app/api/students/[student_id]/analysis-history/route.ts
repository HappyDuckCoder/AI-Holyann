/**
 * Profile Analysis History API
 *
 * GET /api/students/[student_id]/analysis-history
 * - Lấy lịch sử phân tích hồ sơ của student
 * - Query params: limit (default: 10), include_full (boolean)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ student_id: string }> }
) {
  try {
    const { student_id } = await context.params;

    // Auth check - try to get session, but allow if API is called internally
    let session: any = null;
    try {
      const { authOptions } = await import('@/lib/auth/auth-config');
      session = await getServerSession(authOptions);
    } catch {
      // authOptions may not exist, allow internal calls
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const analysisId = searchParams.get('id');

    // If specific analysis ID requested
    if (analysisId) {
      const analysis = await prisma.profile_analyses.findUnique({
        where: { id: analysisId },
      });

      if (!analysis) {
        return NextResponse.json(
          { error: 'Không tìm thấy kết quả phân tích', success: false },
          { status: 404 }
        );
      }

      // Parse full_result from swot_data or academic_data for legacy support
      const fullResult = (analysis as any).full_result || null;

      return NextResponse.json({
        success: true,
        data: {
          id: analysis.id,
          analysisDate: analysis.analysis_date,
          fullResult: fullResult,
          pillarScores: {
            aca: (analysis as any).score_aca ?? analysis.academic_score,
            lan: (analysis as any).score_lan ?? 0,
            hdnk: (analysis as any).score_hdnk ?? analysis.extracurricular_score,
            skill: (analysis as any).score_skill ?? 0,
          },
          regionalScores: {
            usa: (analysis as any).score_usa ?? 0,
            asia: (analysis as any).score_asia ?? 0,
            europe: (analysis as any).score_europe ?? 0,
          },
          mainSpike: (analysis as any).main_spike ?? null,
          spikeSharpness: (analysis as any).spike_sharpness ?? null,
          spikeScore: (analysis as any).spike_score ?? 0,
          swotData: analysis.swot_data,
        },
      });
    }

    // Get latest analysis
    const latestAnalysis = await prisma.profile_analyses.findFirst({
      where: { student_id },
      orderBy: { analysis_date: 'desc' },
    });

    // Get history
    const history = await prisma.profile_analyses.findMany({
      where: { student_id },
      orderBy: { analysis_date: 'desc' },
      take: limit,
    });

    const mapAnalysis = (a: any) => ({
      id: a.id,
      analysisDate: a.analysis_date,
      pillarScores: {
        aca: a.score_aca ?? a.academic_score ?? 0,
        lan: a.score_lan ?? 0,
        hdnk: a.score_hdnk ?? a.extracurricular_score ?? 0,
        skill: a.score_skill ?? 0,
      },
      regionalScores: {
        usa: a.score_usa ?? 0,
        asia: a.score_asia ?? 0,
        europe: a.score_europe ?? 0,
      },
      mainSpike: a.main_spike ?? null,
      spikeSharpness: a.spike_sharpness ?? null,
      overallScore: a.overall_score,
      createdAt: a.created_at,
    });

    return NextResponse.json({
      success: true,
      hasAnalysis: !!latestAnalysis,
      latest: latestAnalysis ? {
        ...mapAnalysis(latestAnalysis),
        fullResult: (latestAnalysis as any).full_result || null,
        swotData: latestAnalysis.swot_data,
      } : null,
      history: history.map(mapAnalysis),
      totalCount: history.length,
    });
  } catch (error: any) {
    console.error('❌ [Analysis History API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi server', success: false },
      { status: 500 }
    );
  }
}
