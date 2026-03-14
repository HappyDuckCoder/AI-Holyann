import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLimit, type SubscriptionPlan } from "@/lib/subscription";

export async function GET(
  _request: Request,
  context: { params: Promise<{ student_id: string }> }
) {
  const { student_id: studentId } = await context.params;
  try {
    const user = await prisma.users.findUnique({
      where: { id: studentId },
    });
    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    const plan = (user.subscription_plan as SubscriptionPlan) ?? "FREE";
    const analysisLimitRaw = getLimit(plan, "profileAnalysisLimit");
    const enhanceLimitRaw = getLimit(plan, "profileEnhanceLimit");
    const analysisLimit = typeof analysisLimitRaw === "number" ? analysisLimitRaw : analysisLimitRaw === true ? 1 : 0;
    const enhanceLimit = typeof enhanceLimitRaw === "number" ? enhanceLimitRaw : enhanceLimitRaw === true ? 1 : 0;

    const [analysisUsed, enhanceUsed] = await Promise.all([
      prisma.profile_analyses.count({ where: { student_id: studentId } }),
      prisma.profile_improve_results.count({ where: { student_id: studentId } }),
    ]);

    return NextResponse.json({
      plan,
      analysisLimit: analysisLimit === -1 ? null : analysisLimit,
      analysisUsed,
      enhanceLimit: enhanceLimit === -1 ? null : enhanceLimit,
      enhanceUsed,
    });
  } catch {
    return NextResponse.json({ error: "Lỗi lấy giới hạn" }, { status: 500 });
  }
}
