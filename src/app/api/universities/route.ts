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
      current_ranking?: { gte?: number; lte?: number };
      state?: string | null;
      country?: string;
      OR?: Array<
        | { name: { contains: string; mode: 'insensitive' } }
        | { country: { contains: string; mode: 'insensitive' } }
        | { state: { contains: string; mode: 'insensitive' } }
      >;
    } = {};

    if (region) where.state = region; // fallback region to state since no region exists
    if (country) where.country = country;

    if (minRank !== null && minRank !== undefined && minRank !== '') {
      const n = parseInt(minRank, 10);
      if (!isNaN(n)) {
        where.current_ranking = { ...where.current_ranking, gte: n };
      }
    }
    if (maxRank !== null && maxRank !== undefined && maxRank !== '') {
      const n = parseInt(maxRank, 10);
      if (!isNaN(n)) {
        where.current_ranking = { ...where.current_ranking, lte: n };
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
      ];
    }

    const list = await prisma.universities.findMany({
      where,
      orderBy: { current_ranking: 'asc' },
      select: {
        id: true,
        current_ranking: true,
        name: true,
        country: true,
        state: true,
        website_url: true,
        logo_url: true,
        ai_matching_data: true,
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
