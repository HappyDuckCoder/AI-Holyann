/**
 * GET /api/universities
 * Public API – QS World University Rankings (no auth).
 * Query: ?search=MIT&region=Asia&minRank=1&maxRank=50
 * Returns: { universities: UniversityRanking[], total: number }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const region = searchParams.get('region')?.trim() || '';
    const minRank = searchParams.get('minRank');
    const maxRank = searchParams.get('maxRank');

    const where: {
      qs_rank?: { gte?: number; lte?: number };
      region?: string;
      OR?: Array<{ name?: { contains: string; mode: 'insensitive' }; country?: { contains: string; mode: 'insensitive' }; country_code?: { contains: string; mode: 'insensitive' } }>;
    } = {};

    if (region) {
      where.region = region;
    }

    if (minRank !== null && minRank !== undefined && minRank !== '') {
      const n = parseInt(minRank, 10);
      if (!isNaN(n)) {
        where.qs_rank = { ...where.qs_rank, gte: n };
      }
    }
    if (maxRank !== null && maxRank !== undefined && maxRank !== '') {
      const n = parseInt(maxRank, 10);
      if (!isNaN(n)) {
        where.qs_rank = { ...where.qs_rank, lte: n };
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { country_code: { contains: search, mode: 'insensitive' } },
      ];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- delegate name from schema (university_rankings)
    const list = await (prisma as any).university_rankings.findMany({
      where,
      orderBy: { qs_rank: 'asc' },
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

    return NextResponse.json({ success: true, universities: list, total: list.length });
  } catch (error) {
    console.error('❌ [GET /api/universities] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách trường' },
      { status: 500 }
    );
  }
}
