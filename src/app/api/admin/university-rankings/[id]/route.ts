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

    const data: Parameters<typeof prisma.university_rankings.update>[0]['data'] = {};
    if (qs_rank != null) data.qs_rank = Number(qs_rank);
    if (name != null) data.name = String(name);
    if (country != null) data.country = String(country);
    if (country_code != null) data.country_code = String(country_code);
    if (city !== undefined) data.city = city != null && city !== '' ? String(city) : null;
    if (region !== undefined) data.region = region != null && region !== '' ? String(region) : null;
    if (type !== undefined) data.type = type != null && type !== '' ? String(type) : null;
    if (founded_year !== undefined) data.founded_year = founded_year != null && founded_year !== '' ? Number(founded_year) : null;
    if (total_students !== undefined) data.total_students = total_students != null && total_students !== '' ? Number(total_students) : null;
    if (website !== undefined) data.website = website != null && website !== '' ? String(website) : null;
    if (qs_overall_score !== undefined) data.qs_overall_score = Number(qs_overall_score);
    if (academic_reputation !== undefined) data.academic_reputation = Number(academic_reputation);
    if (employer_reputation !== undefined) data.employer_reputation = Number(employer_reputation);
    if (faculty_student_ratio !== undefined) data.faculty_student_ratio = Number(faculty_student_ratio);
    if (citations_per_faculty !== undefined) data.citations_per_faculty = Number(citations_per_faculty);
    if (international_faculty !== undefined) data.international_faculty = Number(international_faculty);
    if (international_students !== undefined) data.international_students = Number(international_students);
    if (strong_subjects !== undefined) {
      data.strong_subjects = Array.isArray(strong_subjects)
        ? strong_subjects.map((s: string) => String(s))
        : typeof strong_subjects === 'string'
          ? strong_subjects
              .split(/[,;]/)
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [];
    }
    if (description !== undefined) {
      data.description = description != null && description !== '' ? String(description) : null;
    }

    const updated = await prisma.university_rankings.update({
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
    await prisma.university_rankings.delete({
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
