/**
 * GET  /api/student/improve/cv-results — Lấy kết quả phân tích/enhance CV đã lưu.
 * POST /api/student/improve/cv-results — Lưu analysis/enhance hoặc rating. Body: analysis?, enhance?, analysis_rating?, enhance_rating?.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  const studentId = session?.user?.id;
  if (!studentId || session?.user?.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const row = await prisma.cv_improve_results.findUnique({
      where: { student_id: studentId },
    });
    if (!row) {
      return NextResponse.json({
        analysis: null,
        enhance: null,
        analysis_rating: null,
        enhance_rating: null,
        analysis_at: null,
        enhance_at: null,
      });
    }
    return NextResponse.json({
      analysis: row.analysis_result as Record<string, unknown> | null,
      enhance: row.enhance_result as Record<string, unknown> | null,
      analysis_rating: row.analysis_rating,
      enhance_rating: row.enhance_rating,
      analysis_at: row.analysis_at?.toISOString() ?? null,
      enhance_at: row.enhance_at?.toISOString() ?? null,
    });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === 'P2021') {
      return NextResponse.json({
        analysis: null,
        enhance: null,
        analysis_rating: null,
        enhance_rating: null,
        analysis_at: null,
        enhance_at: null,
      });
    }
    console.error('[improve/cv-results] GET error:', e);
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const studentId = session?.user?.id;
  if (!studentId || session?.user?.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let body: {
    analysis?: Record<string, unknown> | null;
    enhance?: Record<string, unknown> | null;
    analysis_rating?: number | null;
    enhance_rating?: number | null;
  } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const { analysis, enhance, analysis_rating, enhance_rating } = body;
  const clamp = (v: number) => Math.min(5, Math.max(1, Math.round(v)));
  try {
    const now = new Date();
    const createData = {
      student_id: studentId,
      ...(analysis != null && { analysis_result: analysis, analysis_at: now }),
      ...(enhance != null && { enhance_result: enhance, enhance_at: now }),
      ...(analysis_rating != null && !Number.isNaN(analysis_rating) && { analysis_rating: clamp(analysis_rating) }),
      ...(enhance_rating != null && !Number.isNaN(enhance_rating) && { enhance_rating: clamp(enhance_rating) }),
    };
    const updateData: Record<string, unknown> = { updated_at: now };
    if (analysis !== undefined) {
      updateData.analysis_result = analysis ?? null;
      updateData.analysis_at = analysis != null ? now : null;
    }
    if (enhance !== undefined) {
      updateData.enhance_result = enhance ?? null;
      updateData.enhance_at = enhance != null ? now : null;
    }
    if (analysis_rating !== undefined) updateData.analysis_rating = analysis_rating == null ? null : clamp(analysis_rating);
    if (enhance_rating !== undefined) updateData.enhance_rating = enhance_rating == null ? null : clamp(enhance_rating);

    await prisma.cv_improve_results.upsert({
      where: { student_id: studentId },
      create: createData as Parameters<typeof prisma.cv_improve_results.upsert>[0]['create'],
      update: updateData as Parameters<typeof prisma.cv_improve_results.upsert>[0]['update'],
    });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === 'P2021') {
      return NextResponse.json({ error: 'Table not ready. Run: npx prisma migrate deploy' }, { status: 503 });
    }
    console.error('[improve/cv-results] POST error:', e);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
