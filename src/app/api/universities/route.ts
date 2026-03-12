/**
 * GET /api/universities
 * Public API – danh sách trường QS (schema: university_rankings).
 * Query: ?search=MIT&region=Europe&country=US&minRank=1&maxRank=50
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const region = searchParams.get('region')?.trim() || '';
    const country = searchParams.get('country')?.trim() || '';
    const minRank = searchParams.get('minRank');
    const maxRank = searchParams.get('maxRank');

    const where: {
      qs_rank?: { gte?: number; lte?: number };
      region?: string | null;
      country?: string;
      OR?: Array<
        | { name: { contains: string; mode: 'insensitive' } }
        | { country: { contains: string; mode: 'insensitive' } }
        | { city: { contains: string; mode: 'insensitive' } }
      >;
    } = {};

    if (region) where.region = region;
    if (country) where.country = country;

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
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const list = await prisma.university_rankings.findMany({
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
        website: true,
        qs_overall_score: true,
        strong_subjects: true,
      },
    });

    return NextResponse.json({ success: true, universities: list, total: list.length });
  } catch (error) {
    console.error('❌ [GET /api/universities] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách trường' },
      { status: 500 },
    );
  }
}
