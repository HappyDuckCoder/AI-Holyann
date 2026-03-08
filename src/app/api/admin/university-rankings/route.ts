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
    const list = await prisma.university_rankings.findMany({
      orderBy: { qs_rank: 'asc' },
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

    if (
      qs_rank == null ||
      !name ||
      !country ||
      !country_code ||
      qs_overall_score == null ||
      academic_reputation == null ||
      employer_reputation == null ||
      faculty_student_ratio == null ||
      citations_per_faculty == null ||
      international_faculty == null ||
      international_students == null
    ) {
      return NextResponse.json(
        { error: 'Thiếu trường bắt buộc: qs_rank, name, country, country_code, các điểm số' },
        { status: 400 }
      );
    }

    const subjects = Array.isArray(strong_subjects) ? strong_subjects : [];
    const created = await prisma.university_rankings.create({
      data: {
        qs_rank: Number(qs_rank),
        name: String(name),
        country: String(country),
        country_code: String(country_code),
        city: city != null ? String(city) : null,
        region: region != null ? String(region) : null,
        type: type != null ? String(type) : null,
        founded_year: founded_year != null && founded_year !== '' ? Number(founded_year) : null,
        total_students: total_students != null && total_students !== '' ? Number(total_students) : null,
        website: website != null && website !== '' ? String(website) : null,
        qs_overall_score: Number(qs_overall_score),
        academic_reputation: Number(academic_reputation),
        employer_reputation: Number(employer_reputation),
        faculty_student_ratio: Number(faculty_student_ratio),
        citations_per_faculty: Number(citations_per_faculty),
        international_faculty: Number(international_faculty),
        international_students: Number(international_students),
        strong_subjects: subjects.map(String),
        description: description != null && description !== '' ? String(description) : null,
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
