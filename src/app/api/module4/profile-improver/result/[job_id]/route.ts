/**
 * GET /api/module4/profile-improver/result/[job_id]
 * Poll kết quả job async (analysis/enhance). Proxy tới server-ai.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ job_id: string }> }
) {
  const { job_id } = await params;
  if (!job_id) {
    return NextResponse.json({ error: 'Missing job_id' }, { status: 400 });
  }
  const baseUrl = (process.env.AI_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
  const url = `${baseUrl}/hoexapp/api/profile-improver/result/${encodeURIComponent(job_id)}/`;
  try {
    const res = await fetch(url, { method: 'GET', cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('❌ [profile-improver result] Error:', err);
    return NextResponse.json(
      { status: 'error', error: err instanceof Error ? err.message : 'Failed to fetch result' },
      { status: 500 }
    );
  }
}
