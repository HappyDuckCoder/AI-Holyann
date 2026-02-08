/**
 * GET /api/student/improve/profile-data
 * Trả về feature1_output, feature2_output, feature3_output từ DB để gọi Profile Improver (Feature 4).
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';
import { TestStatus } from '@prisma/client';

function buildFeature1FromProfile(analysis: {
  summary: string | null;
  swot_data: unknown;
  overall_score: number | null;
  academic_score: number | null;
  extracurricular_score: number | null;
}) {
  const aca = analysis.academic_score != null ? Math.round(analysis.academic_score * 10) : 70;
  const hdnk = analysis.extracurricular_score != null ? Math.round(analysis.extracurricular_score * 10) : 70;
  const overall = analysis.overall_score ?? 75;
  return {
    summary: {
      success: true,
      total_pillar_scores: {
        aca,
        lan: 70,
        hdnk,
        skill: 70,
      },
      main_spike: 'Academic Excellence',
      sharpness: overall >= 80 ? 'High' : overall >= 60 ? 'Medium' : 'Low',
    },
    ...(analysis.summary && { summaryText: analysis.summary }),
    ...(analysis.swot_data && typeof analysis.swot_data === 'object' && {
      'B. Phân tích SWOT': analysis.swot_data,
    }),
  };
}

function buildFeature2FromTests(
  mbti: { result_type: string | null; score_e: number | null; score_i: number | null; score_s: number | null; score_n: number | null; score_t: number | null; score_f: number | null; score_j: number | null; score_p: number | null } | null,
  grit: { total_score: number | null; passion_score: number | null; perseverance_score: number | null; level: string | null; description: string | null } | null,
  riasec: { result_code: string | null; score_realistic: number | null; score_investigative: number | null; score_artistic: number | null; score_social: number | null; score_enterprising: number | null; score_conventional: number | null; top_3_types: unknown } | null
) {
  const assessment: Record<string, unknown> = {};
  if (mbti && mbti.result_type) {
    assessment.mbti = {
      personality_type: mbti.result_type,
      dimension_scores: {
        E: (mbti.score_e ?? 0) / 100,
        I: (mbti.score_i ?? 0) / 100,
        S: (mbti.score_s ?? 0) / 100,
        N: (mbti.score_n ?? 0) / 100,
        T: (mbti.score_t ?? 0) / 100,
        F: (mbti.score_f ?? 0) / 100,
        J: (mbti.score_j ?? 0) / 100,
        P: (mbti.score_p ?? 0) / 100,
      },
      confidence: 0.9,
    };
  } else {
    assessment.mbti = { personality_type: 'INTJ', dimension_scores: { E: 0.2, I: 0.8, S: 0.3, N: 0.7, T: 0.7, F: 0.3, J: 0.8, P: 0.2 }, confidence: 0.5 };
  }
  if (grit) {
    assessment.grit = {
      score: grit.total_score ?? 3.5,
      level: grit.level ?? 'Trung bình',
      description: grit.description ?? 'Điểm Grit từ bài test.',
      passion_score: grit.passion_score,
      perseverance_score: grit.perseverance_score,
    };
  } else {
    assessment.grit = { score: 3.5, level: 'Trung bình', description: 'Chưa có điểm Grit.', passion_score: 3.5, perseverance_score: 3.5 };
  }
  if (riasec) {
    const scores = {
      Realistic: riasec.score_realistic ?? 0,
      Investigative: riasec.score_investigative ?? 0,
      Artistic: riasec.score_artistic ?? 0,
      Social: riasec.score_social ?? 0,
      Enterprising: riasec.score_enterprising ?? 0,
      Conventional: riasec.score_conventional ?? 0,
    };
    let top3: [string, number][] = [];
    const saved = riasec.top_3_types;
    if (Array.isArray(saved) && saved.length > 0) {
      top3 = saved
        .filter((x): x is unknown[] => Array.isArray(x) && x.length >= 2)
        .map((x) => [String(x[0]), Number(x[1])] as [string, number])
        .slice(0, 3);
    }
    if (top3.length === 0) {
      top3 = Object.entries(scores)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3) as [string, number][];
    }
    assessment.riasec = { code: riasec.result_code ?? top3.map(([c]) => c).join(''), scores, top3 };
  } else {
    assessment.riasec = { code: 'RIA', scores: { Realistic: 80, Investigative: 100, Artistic: 60, Social: 40, Enterprising: 30, Conventional: 50 }, top3: [['Investigative', 100], ['Realistic', 80], ['Artistic', 60]] };
  }
  return { success: true, assessment, recommendations: [] };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const studentId = session.user.id;

    const [latestAnalysis, mbti, grit, riasec, latestF3] = await Promise.all([
      prisma.profile_analyses.findFirst({
        where: { student_id: studentId },
        orderBy: { analysis_date: 'desc' },
        select: {
          summary: true,
          swot_data: true,
          overall_score: true,
          academic_score: true,
          extracurricular_score: true,
        },
      }),
      prisma.mbti_tests.findUnique({ where: { student_id: studentId } }),
      prisma.grit_tests.findUnique({ where: { student_id: studentId } }),
      prisma.riasec_tests.findUnique({ where: { student_id: studentId } }),
      prisma.student_university_recommendations.findFirst({
        where: { student_id: studentId },
        orderBy: { created_at: 'desc' },
        select: { summary: true, roadmap: true, universities: true },
      }),
    ]);

    const mbtiOk = mbti?.status === TestStatus.COMPLETED ? mbti : null;
    const gritOk = grit?.status === TestStatus.COMPLETED ? grit : null;
    const riasecOk = riasec?.status === TestStatus.COMPLETED ? riasec : null;

    const feature1_output = latestAnalysis
      ? buildFeature1FromProfile(latestAnalysis)
      : buildFeature1FromProfile({
          summary: null,
          swot_data: null,
          overall_score: 75,
          academic_score: 7.5,
          extracurricular_score: 7,
        });

    const feature2_output = buildFeature2FromTests(mbtiOk, gritOk, riasecOk);

    const feature3_output = latestF3
      ? {
          success: true,
          universities: latestF3.universities ?? {},
          roadmap: latestF3.roadmap ?? {},
          summary: latestF3.summary ?? {},
        }
      : {
          success: true,
          universities: {},
          roadmap: {},
          summary: {},
        };

    return NextResponse.json({
      success: true,
      feature1_output,
      feature2_output,
      feature3_output,
    });
  } catch (error) {
    console.error('❌ [improve/profile-data] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Lỗi khi lấy dữ liệu profile' },
      { status: 500 }
    );
  }
}
