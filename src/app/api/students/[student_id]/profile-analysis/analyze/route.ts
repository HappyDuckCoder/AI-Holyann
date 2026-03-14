import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-config";
import { prisma } from "@/lib/prisma";
import { getLimit, type SubscriptionPlan } from "@/lib/subscription";
import { callProfileAnalysis } from "@/lib/ai-api-client";
import { buildProfilePayloadFromDb } from "@/lib/build-profile-payload";
import type { Feature1AnalysisOutput } from "@/lib/schemas/profile-analysis-v2.schema";

export const maxDuration = 300;

function normalizePlan(raw: string | null | undefined): SubscriptionPlan {
  const upper = (raw ?? "FREE")?.toString?.().trim?.().toUpperCase?.() ?? "FREE";
  if (upper === "ADVANCED") return "PREMIUM";
  if (["FREE", "PLUS", "PREMIUM"].includes(upper)) return upper as SubscriptionPlan;
  return "FREE";
}

export async function POST(
  _request: Request,
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

    const session = await getServerSession(authOptions);
    const sessionUserId = (session?.user as { id?: string })?.id;
    const sessionPlanRaw = (session?.user as { subscriptionPlan?: string })?.subscriptionPlan;
    const sessionPlan = typeof sessionPlanRaw === "string" ? sessionPlanRaw.trim().toUpperCase() : "";
    const isCurrentUser = String(sessionUserId) === String(studentId);

    // Khi là user đang đăng nhập: đọc lại subscription_plan từ DB (tránh cache) rồi ưu tiên session nếu DB vẫn FREE
    let plan = normalizePlan(user.subscription_plan as string);
    if (isCurrentUser) {
      const fresh = await prisma.users.findUnique({
        where: { id: studentId },
        select: { subscription_plan: true },
      });
      plan = normalizePlan(fresh?.subscription_plan as string);
      if (plan === "FREE" && sessionPlan && ["PLUS", "PREMIUM"].includes(sessionPlan)) {
        plan = sessionPlan as SubscriptionPlan;
      }
    }

    const limitRaw = getLimit(plan, "profileAnalysisLimit");
    const limit = typeof limitRaw === "number" ? limitRaw : limitRaw === true ? 1 : 0;
    const used = await prisma.profile_analyses.count({ where: { student_id: studentId } });

    if (limit !== -1 && used >= limit) {
      if (isCurrentUser) {
        const recheck = await prisma.users.findUnique({
          where: { id: studentId },
          select: { subscription_plan: true },
        });
        const recheckPlan = normalizePlan(recheck?.subscription_plan as string);
        if (recheckPlan === "PLUS" || recheckPlan === "PREMIUM" || (sessionPlan && ["PLUS", "PREMIUM"].includes(sessionPlan))) {
          plan = (recheckPlan !== "FREE" ? recheckPlan : sessionPlan) as SubscriptionPlan;
        } else {
          return NextResponse.json(
            { error: "Bạn đã dùng hết số lần đánh giá theo gói. Vui lòng nâng cấp.", limit, used },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Bạn đã dùng hết số lần đánh giá theo gói. Vui lòng nâng cấp.", limit, used },
          { status: 403 }
        );
      }
    }

    const body = await buildProfilePayloadFromDb(studentId);
    if (!body) {
      return NextResponse.json({ error: "Không tìm thấy hồ sơ học sinh" }, { status: 404 });
    }
    if (body.gpa?.value_10 == null) {
      return NextResponse.json(
        { error: "Vui lòng cập nhật GPA trong Cập nhật hồ sơ trước khi phân tích." },
        { status: 400 }
      );
    }

    const result = (await callProfileAnalysis(body)) as Feature1AnalysisOutput;
    if (!result?.pillar_scores || !result?.areas || !result?.swot) {
      return NextResponse.json(
        { error: "Dữ liệu phân tích không hợp lệ từ AI" },
        { status: 500 }
      );
    }

    const ps = result.pillar_scores;
    const now = new Date();
    await prisma.profile_analyses.create({
      data: {
        id: randomUUID(),
        student_id: studentId,
        input_data: body as unknown as object,
        full_result: result as unknown as object,
        swot_data: result.swot as unknown as object,
        score_aca: typeof ps.academic === "number" ? (ps.academic <= 1 ? ps.academic * 100 : ps.academic) : null,
        score_lan: typeof ps.language === "number" ? (ps.language <= 1 ? ps.language * 100 : ps.language) : null,
        score_hdnk: typeof ps.extracurricular === "number" ? (ps.extracurricular <= 1 ? ps.extracurricular * 100 : ps.extracurricular) : null,
        score_skill: typeof ps.skills === "number" ? (ps.skills <= 1 ? ps.skills * 100 : ps.skills) : null,
        updated_at: now,
      },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Lỗi phân tích hồ sơ";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
