/**
 * GET  /api/student/improve/essay-results?essay_id=... — Lấy kết quả phân tích/enhance đã lưu cho essay.
 * POST /api/student/improve/essay-results — Lưu analysis/enhance hoặc rating. Body: essay_id, analysis?, enhance?, analysis_rating?, enhance_rating?.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const studentId = session?.user?.id;
  if (!studentId || session?.user?.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const essayId = request.nextUrl.searchParams.get('essay_id');
  if (!essayId) {
    return NextResponse.json({ error: 'Thiếu essay_id' }, { status: 400 });
  }
  try {
    const essay = await prisma.essays.findFirst({
      where: { id: essayId, student_id: studentId },
      include: { improve_result: true },
    });
    if (!essay?.improve_result) {
      return NextResponse.json({
        analysis: null,
        enhance: null,
        analysis_rating: null,
        enhance_rating: null,
        analysis_at: null,
        enhance_at: null,
      });
    }
    const r = essay.improve_result;
    return NextResponse.json({
      analysis: r.analysis_result as Record<string, unknown> | null,
      enhance: r.enhance_result as Record<string, unknown> | null,
      analysis_rating: r.analysis_rating,
      enhance_rating: r.enhance_rating,
      analysis_at: r.analysis_at?.toISOString() ?? null,
      enhance_at: r.enhance_at?.toISOString() ?? null,
    });
  } catch (e) {
    console.error('[improve/essay-results] GET error:', e);
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
    essay_id: string;
    analysis?: Record<string, unknown> | null;
    enhance?: Record<string, unknown> | null;
    analysis_rating?: number | null;
    enhance_rating?: number | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const { essay_id, analysis, enhance, analysis_rating, enhance_rating } = body;
  if (!essay_id) {
    return NextResponse.json({ error: 'Thiếu essay_id' }, { status: 400 });
  }
  const essay = await prisma.essays.findFirst({
    where: { id: essay_id, student_id: studentId },
  });
  if (!essay) {
    return NextResponse.json({ error: 'Essay không tồn tại hoặc không thuộc về bạn' }, { status: 404 });
  }
  const clamp = (v: number) => Math.min(5, Math.max(1, Math.round(v)));
  try {
    const now = new Date();
    const data: Record<string, unknown> = { updated_at: now };
    if (analysis !== undefined) {
      data.analysis_result = analysis ?? null;
      data.analysis_at = analysis != null ? now : null;
    }
    if (enhance !== undefined) {
      data.enhance_result = enhance ?? null;
      data.enhance_at = enhance != null ? now : null;
    }
    if (analysis_rating !== undefined) data.analysis_rating = analysis_rating == null ? null : clamp(analysis_rating);
    if (enhance_rating !== undefined) data.enhance_rating = enhance_rating == null ? null : clamp(enhance_rating);

    const createPayload: Prisma.essay_improve_resultsUncheckedCreateInput = {
      essay_id: essay_id,
      ...data,
    };
    await prisma.essay_improve_results.upsert({
      where: { essay_id: essay_id },
      create: createPayload,
      update: data as Prisma.essay_improve_resultsUncheckedUpdateInput,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[improve/essay-results] POST error:', e);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
