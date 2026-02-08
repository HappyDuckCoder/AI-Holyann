/**
 * POST /api/module4/essay-improver/enhance
 * Proxy to server-ai. Body: essay_text, limit_words?, language?, use_nlp?, target_major_onet?, async?.
 */

import { NextRequest, NextResponse } from 'next/server';

const AI_BASE = (process.env.AI_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const essayText = (payload.essay_text || '').trim();
    if (!essayText) {
      return NextResponse.json({ error: 'Thiếu essay_text' }, { status: 400 });
    }
    const useAsync = payload.async === true;
    const url = `${AI_BASE}/hoexapp/api/essay-improver/enhance/${useAsync ? '?async=1' : ''}`;
    const timeoutMs = useAsync ? 15000 : 300000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        essay_text: essayText,
        limit_words: payload.limit_words ?? 650,
        language: payload.language ?? 'en',
        use_nlp: payload.use_nlp !== false,
        target_major_onet: payload.target_major_onet ?? '',
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
