/**
 * GET /api/universities
 * Liệt kê danh sách trường đại học có trong DB (bảng universities)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const list = await prisma.universities.findMany({
      orderBy: [{ current_ranking: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        country: true,
        state: true,
        current_ranking: true,
        website_url: true,
        logo_url: true,
        essay_requirements: true,
        scholarship_info: true,
      },
    });

    return NextResponse.json({ success: true, universities: list });
  } catch (error) {
    console.error('❌ [GET /api/universities] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách trường' },
      { status: 500 }
    );
  }
}
