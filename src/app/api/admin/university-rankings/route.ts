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
      !country_code
    ) {
      return NextResponse.json(
        { error: 'Thiếu trường bắt buộc: qs_rank, name, country, country_code' },
        { status: 400 }
      );
    }

    const created = await prisma.university_rankings.create({
      data: {
        qs_rank: Number(qs_rank),
        name: String(name),
        country: String(country),
        country_code: String(country_code),
        city: city != null && city !== '' ? String(city) : null,
        region: region != null && region !== '' ? String(region) : null,
        type: type != null && type !== '' ? String(type) : null,
        founded_year: founded_year != null && founded_year !== '' ? Number(founded_year) : null,
        total_students: total_students != null && total_students !== '' ? Number(total_students) : null,
        website: website != null && website !== '' ? String(website) : null,
        qs_overall_score: qs_overall_score != null ? Number(qs_overall_score) : 0,
        academic_reputation: academic_reputation != null ? Number(academic_reputation) : 0,
        employer_reputation: employer_reputation != null ? Number(employer_reputation) : 0,
        faculty_student_ratio: faculty_student_ratio != null ? Number(faculty_student_ratio) : 0,
        citations_per_faculty: citations_per_faculty != null ? Number(citations_per_faculty) : 0,
        international_faculty: international_faculty != null ? Number(international_faculty) : 0,
        international_students: international_students != null ? Number(international_students) : 0,
        strong_subjects: Array.isArray(strong_subjects)
          ? strong_subjects.map((s: string) => String(s))
          : typeof strong_subjects === 'string'
            ? strong_subjects
                .split(/[,;]/)
                .map((s: string) => s.trim())
                .filter(Boolean)
            : [],
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
