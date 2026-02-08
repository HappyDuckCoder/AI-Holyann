/**
 * POST /api/module4/cv-improver/analysis
 * Proxy to server-ai. Body: cv_text, target_field?, target_group?, use_nlp?, async?.
 */

import { NextRequest, NextResponse } from 'next/server';

const AI_BASE = (process.env.AI_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const cvText = (payload.cv_text || '').trim();
    if (!cvText) {
      return NextResponse.json({ error: 'Thiếu cv_text' }, { status: 400 });
    }
    const useAsync = payload.async === true;
    const url = `${AI_BASE}/hoexapp/api/cv-improver/analysis/${useAsync ? '?async=1' : ''}`;
    const timeoutMs = useAsync ? 15000 : 300000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cv_text: cvText,
        target_field: payload.target_field ?? '',
        target_group: payload.target_group ?? '',
        use_nlp: payload.use_nlp !== false,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      return NextResponse.json(err, { status: res.status });
    }
    const data = await res.json();
    if (res.status === 202 && data.job_id) {
      return NextResponse.json({ job_id: data.job_id }, { status: 202 });
    }
    return NextResponse.json(data);
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      return NextResponse.json({ error: 'Hết thời gian chờ' }, { status: 504 });
    }
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi' }, { status: 500 });
  }
}
