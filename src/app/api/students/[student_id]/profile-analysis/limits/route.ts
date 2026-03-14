import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-config";
import { prisma } from "@/lib/prisma";
import { getLimit, type SubscriptionPlan } from "@/lib/subscription";

function normalizePlan(raw: string | null | undefined): SubscriptionPlan {
  const upper = (raw ?? "FREE")?.toString?.().trim?.().toUpperCase?.() ?? "FREE";
  if (upper === "ADVANCED") return "PREMIUM";
  if (["FREE", "PLUS", "PREMIUM"].includes(upper)) return upper as SubscriptionPlan;
  return "FREE";
}

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

    let plan = normalizePlan(user.subscription_plan as string);
    if (plan === "FREE") {
      const session = await getServerSession(authOptions);
      const sessionUserId = (session?.user as { id?: string })?.id;
      const sessionPlan = (session?.user as { subscriptionPlan?: string })?.subscriptionPlan?.toString?.().trim?.().toUpperCase?.();
      if (String(sessionUserId) === String(studentId) && sessionPlan && ["PLUS", "PREMIUM"].includes(sessionPlan)) {
        plan = sessionPlan as SubscriptionPlan;
      }
    }
    const analysisLimitRaw = getLimit(plan, "profileAnalysisLimit");
    const enhanceLimitRaw = getLimit(plan, "profileEnhanceLimit");
    const analysisLimit = typeof analysisLimitRaw === "number" ? analysisLimitRaw : analysisLimitRaw === true ? 1 : 0;
    const enhanceLimit = typeof enhanceLimitRaw === "number" ? enhanceLimitRaw : enhanceLimitRaw === true ? 1 : 0;

    const [analysisUsed, enhanceUsed] = await Promise.all([
      prisma.profile_analyses.count({ where: { student_id: studentId } }),
      prisma.profile_improve_results.count({ where: { student_id: studentId } }),
    ]);

    // Còn lại = limit - used (null = không giới hạn)
    const analysisRemaining =
      analysisLimit === -1 ? null : Math.max(0, analysisLimit - analysisUsed);
    const enhanceRemaining =
      enhanceLimit === -1 ? null : Math.max(0, enhanceLimit - enhanceUsed);

    return NextResponse.json({
      plan,
      analysisLimit: analysisLimit === -1 ? null : analysisLimit,
      analysisUsed,
      analysisRemaining,
      enhanceLimit: enhanceLimit === -1 ? null : enhanceLimit,
      enhanceUsed,
      enhanceRemaining,
    });
  } catch {
    return NextResponse.json({ error: "Lỗi lấy giới hạn" }, { status: 500 });
  }
}
