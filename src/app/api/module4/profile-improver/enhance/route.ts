/**
 * Module 4: Profile Improver - Enhance API (Feature 4)
 * 
 * POST /api/module4/profile-improver/enhance/
 * 
 * Enhance profile: đề xuất hành động từ F1, F2, F3
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Validate required fields
    if (!payload.feature1_output || !payload.feature2_output || !payload.feature3_output) {
      return NextResponse.json(
        {
          success: false,
          error: 'Thiếu trường bắt buộc. Cần: feature1_output, feature2_output, feature3_output',
        },
        { status: 400 }
      );
    }

    const AI_API_BASE = process.env.AI_API_URL || "http://127.0.0.1:8000";
    const baseUrl = AI_API_BASE.replace(/\/+$/, "");
    const useAsync = payload.async === true;
    const url = `${baseUrl}/hoexapp/api/profile-improver/enhance/${useAsync ? '?async=1' : ''}`;
    const timeoutMs = useAsync ? 15000 : 170000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feature1_output: payload.feature1_output,
        feature2_output: payload.feature2_output,
        feature3_output: payload.feature3_output,
        use_nlp: payload.use_nlp !== undefined ? payload.use_nlp : true,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: { error?: string };
      try {
        errorData = errorText ? JSON.parse(errorText) : { error: "Unknown error" };
      } catch {
        errorData = { error: errorText || "Unknown error" };
      }
      throw new Error(errorData.error || `AI API returned ${response.status}`);
    }

    const result = await response.json();
    if (response.status === 202 && result.job_id) {
      return NextResponse.json({ job_id: result.job_id }, { status: 202 });
    }
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('❌ [Module 4 - Profile Improver Enhance API] Timeout');
      return NextResponse.json(
        { success: false, error: 'Đề xuất cải thiện mất quá nhiều thời gian. Vui lòng thử lại.' },
        { status: 504 }
      );
    }
    console.error('❌ [Module 4 - Profile Improver Enhance API] Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Lỗi khi enhance profile',
      },
      { status: 500 }
    );
  }
}
