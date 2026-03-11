/**
 * Admin API – bulk upsert university_rankings from CSV.
 * POST: body = FormData with "file" (CSV) or Content-Type: text/csv with raw body.
 * CSV header: qs_rank,name,country,country_code,city,region,type,founded_year,total_students,website,qs_overall_score,academic_reputation,employer_reputation,faculty_student_ratio,citations_per_faculty,international_faculty,international_students,strong_subjects,description
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';

function isAdmin(session: { user?: { role?: string } } | null) {
  const role = session?.user?.role;
  return role === 'ADMIN' || role === 'admin';
}

/** Parse one CSV line respecting double-quoted fields */
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (inQuotes) {
      cur += c;
    } else if (c === ',') {
      out.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const header = parseCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    header.forEach((h, j) => {
      row[h] = values[j] ?? '';
    });
    rows.push(row);
  }
  return rows;
}

function num(v: string): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function toFloat(v: string): number {
  const n = num(v);
  return n != null ? n : 0;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let csvText: string;
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      if (!file || typeof file === 'string') {
        return NextResponse.json({ error: 'Cần gửi file CSV (field: file)' }, { status: 400 });
      }
      csvText = await file.text();
    } else if (contentType.includes('text/csv') || contentType.includes('text/plain')) {
      csvText = await request.text();
    } else {
      const body = await request.json().catch(() => null);
      if (body && typeof body.csv === 'string') csvText = body.csv;
      else if (body && typeof body.content === 'string') csvText = body.content;
      else return NextResponse.json({ error: 'Gửi file CSV (form-data file) hoặc body text/csv' }, { status: 400 });
    }

    const rows = parseCsv(csvText);
    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        created: 0,
        updated: 0,
        errors: ['CSV trống hoặc không có dòng dữ liệu'],
      });
    }

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const qsRank = num(r.qs_rank ?? r['qs_rank']);
      const name = (r.name ?? '').trim();
      const country = (r.country ?? '').trim();
      const countryCode = (r.country_code ?? r['country_code'] ?? '').trim();
      if (qsRank == null || !name || !country || !countryCode) {
        errors.push(`Dòng ${i + 2}: thiếu qs_rank, name, country hoặc country_code`);
        continue;
      }
      const strongSubjectsStr = (r.strong_subjects ?? r['strong_subjects'] ?? '').trim();
      const strongSubjects = strongSubjectsStr
        ? strongSubjectsStr.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
        : [];

      const data = {
        current_ranking: qsRank,
        name,
        country,
        state: (r.city ?? '').trim() || null,
        website_url: (r.website ?? '').trim() || null,
      };

      try {
        const existing = await prisma.universities.findFirst({
          where: { name },
        });
        
        if (existing) {
          await prisma.universities.update({
            where: { id: existing.id },
            data,
          });
          updated++;
        } else {
          await prisma.universities.create({
            data,
          });
          created++;
        }
      } catch (e) {
        errors.push(`Dòng ${i + 2} (name=${name}): ${e instanceof Error ? e.message : 'Lỗi'}`);
      }
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
      total: rows.length,
      errors: errors.length ? errors : undefined,
    });
  } catch (error) {
    console.error('[POST /api/admin/university-rankings/bulk]', error);
    return NextResponse.json(
      { error: 'Bulk upsert thất bại', detail: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}
