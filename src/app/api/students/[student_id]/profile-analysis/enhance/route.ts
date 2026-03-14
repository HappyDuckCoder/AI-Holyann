import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getLimit, type SubscriptionPlan } from "@/lib/subscription";
import { callEnhanceProfile } from "@/lib/ai-api-client";
import type { Feature1EnhanceOutput } from "@/lib/schemas/profile-analysis-v2.schema";

export const maxDuration = 300;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ student_id: string }> }
) {
  const { student_id: studentId } = await context.params;
  try {
    const user = await prisma.users.findUnique({
      where: { id: studentId },
      include: { students: true },
    });
    if (!user?.students) {
      return NextResponse.json({ error: "Không tìm thấy học sinh" }, { status: 404 });
    }

    const plan = (user.subscription_plan as SubscriptionPlan) ?? "FREE";
    const limitRaw = getLimit(plan, "profileEnhanceLimit");
    const limit = typeof limitRaw === "number" ? limitRaw : limitRaw === true ? 1 : 0;
    const used = await prisma.profile_improve_results.count({ where: { student_id: studentId } });
    if (limit !== -1 && used >= limit) {
      return NextResponse.json(
        {
          error: "Bạn đã dùng hết số lần cải thiện theo gói. Vui lòng nâng cấp.",
          limit,
          used,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const willing_area = body?.willing_area === "B" || body?.willing_area === "C" ? body.willing_area : "A";

    const latest = await prisma.profile_analyses.findFirst({
      where: { student_id: studentId },
      orderBy: { analysis_date: "desc" },
    });
    const fullResult = latest?.full_result as Record<string, unknown> | null;
    if (!fullResult?.pillar_scores || !fullResult?.areas || !fullResult?.swot) {
      return NextResponse.json(
        { error: "Chưa có kết quả đánh giá hồ sơ. Vui lòng chạy Đánh giá profile trước." },
        { status: 400 }
      );
    }

    const result = (await callEnhanceProfile({
      analysis_information: fullResult,
      willing_area,
    })) as Feature1EnhanceOutput;

    if (!result?.list_suggestion || !result?.roadmap) {
      return NextResponse.json(
        { error: "Dữ liệu cải thiện không hợp lệ từ AI" },
        { status: 500 }
      );
    }

    const now = new Date();
    await prisma.profile_improve_results.create({
      data: {
        id: randomUUID(),
        student_id: studentId,
        enhance_result: result as unknown as object,
        enhance_at: now,
        updated_at: now,
      },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Lỗi cải thiện hồ sơ";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
