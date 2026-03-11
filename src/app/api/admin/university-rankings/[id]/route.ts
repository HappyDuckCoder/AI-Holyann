/**
 * Admin API – PATCH / DELETE university_rankings by id
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';

function isAdmin(session: { user?: { role?: string } } | null) {
  const role = session?.user?.role;
  return role === 'ADMIN' || role === 'admin';
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (Number.isNaN(numId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const body = await request.json();
    const {
      qs_rank,
      name,
      country,
      country_code,
      city,
      region,
      type,
      founded_year,
      total_students,
      website,
      qs_overall_score,
      academic_reputation,
      employer_reputation,
      faculty_student_ratio,
      citations_per_faculty,
      international_faculty,
      international_students,
      strong_subjects,
      description,
    } = body;

    const data: Parameters<typeof prisma.universities.update>[0]['data'] = {};
    if (qs_rank != null) data.current_ranking = Number(qs_rank);
    if (name != null) data.name = String(name);
    if (country != null) data.country = String(country);
    if (city !== undefined) data.state = city != null && city !== '' ? String(city) : null;
    if (website !== undefined) data.website_url = website != null && website !== '' ? String(website) : null;

    const updated = await prisma.universities.update({
      where: { id: numId },
      data,
    });
    return NextResponse.json({ university: updated });
  } catch (error) {
    console.error('[PATCH /api/admin/university-rankings/:id]', error);
    return NextResponse.json(
      { error: 'Không thể cập nhật' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (Number.isNaN(numId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    await prisma.universities.delete({
      where: { id: numId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/admin/university-rankings/:id]', error);
    return NextResponse.json(
      { error: 'Không thể xóa' },
      { status: 500 }
    );
  }
}
