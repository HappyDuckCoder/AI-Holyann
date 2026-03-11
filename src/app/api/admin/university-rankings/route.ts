/**
 * Admin API – CRUD university_rankings (QS)
 * GET: list all. POST: create.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';

function isAdmin(session: { user?: { role?: string } } | null) {
  const role = session?.user?.role;
  return role === 'ADMIN' || role === 'admin';
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const list = await prisma.universities.findMany({
      orderBy: { current_ranking: 'asc' },
    });
    return NextResponse.json({ universities: list });
  } catch (error) {
    console.error('[GET /api/admin/university-rankings]', error);
    return NextResponse.json(
      { error: 'Không thể tải danh sách' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await request.json();
    const {
      qs_rank,
      name,
      country,
      city,
      website,
    } = body;

    if (
      qs_rank == null ||
      !name ||
      !country
    ) {
      return NextResponse.json(
        { error: 'Thiếu trường bắt buộc: qs_rank, name, country' },
        { status: 400 }
      );
    }

    const created = await prisma.universities.create({
      data: {
        current_ranking: Number(qs_rank),
        name: String(name),
        country: String(country),
        state: city != null ? String(city) : null,
        website_url: website != null && website !== '' ? String(website) : null,
      },
    });
    return NextResponse.json({ university: created });
  } catch (error) {
    console.error('[POST /api/admin/university-rankings]', error);
    return NextResponse.json(
      { error: 'Không thể tạo bản ghi' },
      { status: 500 }
    );
  }
}
