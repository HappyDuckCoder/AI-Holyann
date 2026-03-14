import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getLimit, type SubscriptionPlan } from "@/lib/subscription";
import { callProfileAnalysis } from "@/lib/ai-api-client";
import { buildProfilePayloadFromDb } from "@/lib/build-profile-payload";
import type { Feature1AnalysisOutput } from "@/lib/schemas/profile-analysis-v2.schema";

export const maxDuration = 300;

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

    const plan = (user.subscription_plan as SubscriptionPlan) ?? "FREE";
    const limitRaw = getLimit(plan, "profileAnalysisLimit");
    const limit = typeof limitRaw === "number" ? limitRaw : limitRaw === true ? 1 : 0;
    const used = await prisma.profile_analyses.count({ where: { student_id: studentId } });
    if (limit !== -1 && used >= limit) {
      return NextResponse.json(
        {
          error: "Bạn đã dùng hết số lần đánh giá theo gói. Vui lòng nâng cấp.",
          limit,
          used,
        },
        { status: 403 }
      );
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
        analysis_date: now,
        input_data: body as unknown as object,
        full_result: result as unknown as object,
        score_aca: typeof ps.academic === "number" ? (ps.academic <= 1 ? ps.academic * 100 : ps.academic) : null,
        score_lan: typeof ps.language === "number" ? (ps.language <= 1 ? ps.language * 100 : ps.language) : null,
        score_hdnk: typeof ps.extracurricular === "number" ? (ps.extracurricular <= 1 ? ps.extracurricular * 100 : ps.extracurricular) : null,
        score_skill: typeof ps.skills === "number" ? (ps.skills <= 1 ? ps.skills * 100 : ps.skills) : null,
        academic_data: {},
        extracurricular_data: {},
        skill_data: {},
        swot_data: result.swot as unknown as object,
        updated_at: now,
      },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Lỗi phân tích hồ sơ";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
