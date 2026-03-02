/**
 * GET /api/universities/[id]
 * Public API – chi tiết một trường QS (no auth).
 * Returns: UniversityRanking | 404
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- delegate name from schema (university_rankings)
    const university = await (prisma as any).university_rankings.findUnique({
      where: { id },
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
