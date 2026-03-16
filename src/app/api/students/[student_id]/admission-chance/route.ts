import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-config";
import { prisma } from "@/lib/prisma";
import { getLimit, hasQuota, type SubscriptionPlan } from "@/lib/subscription";
import { callAdmissionChance } from "@/lib/ai-api-client";
import { randomUUID } from "crypto";

function normalizePlan(raw: string | null | undefined): SubscriptionPlan {
  const upper = (raw ?? "FREE")?.toString?.().trim?.().toUpperCase?.() ?? "FREE";
  if (upper === "ADVANCED") return "PREMIUM";
  if (["FREE", "PLUS", "PREMIUM"].includes(upper)) return upper as SubscriptionPlan;
  return "FREE";
}

/** POST: Gọi Feature 3 admission-chance (server-ai), kiểm tra limit, lưu kết quả. */
export async function POST(
  _request: Request,
  context: { params: Promise<{ student_id: string }> }
) {
  const { student_id: studentId } = await context.params;
  const session = await getServerSession(authOptions);
  const sessionUserId = (session?.user as { id?: string })?.id ?? (session?.user as { user_id?: string })?.user_id;
  if (!sessionUserId || String(sessionUserId) !== String(studentId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.users.findUnique({ where: { id: studentId } });
    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    let plan = normalizePlan(user.subscription_plan as string);
    if (plan === "FREE") {
      const sessionPlan = (session?.user as { subscriptionPlan?: string })?.subscriptionPlan?.toString?.().trim?.().toUpperCase?.();
      if (sessionPlan && ["PLUS", "PREMIUM"].includes(sessionPlan)) {
        plan = sessionPlan as SubscriptionPlan;
      }
    }

    const used = await prisma.admission_chance_results.count({ where: { student_id: studentId } });
    const limitRaw = getLimit(plan, "admissionChanceLimit");
    const limit = typeof limitRaw === "number" ? limitRaw : 0;
    if (limit !== -1 && used >= limit) {
      return NextResponse.json(
        {
          error:
            "Bạn đã dùng hết số lần xem gợi ý trường (Reach/Match/Safe). Free: 2 lần, Plus: 5 lần, Premium: không giới hạn.",
        },
        { status: 403 }
      );
    }

    const [latestProfile, facultyWishlist, schoolWishlist] = await Promise.all([
      prisma.profile_analyses.findFirst({
        where: { student_id: studentId },
        orderBy: { created_at: "desc" },
        select: {
          full_result: true,
          score_aca: true,
          score_lan: true,
          score_hdnk: true,
          score_skill: true,
        },
      }),
      prisma.faculty_wishlist.findMany({
        where: { student_id: studentId },
        orderBy: { sort_order: "asc" },
        select: { faculty_name: true },
        take: 5,
      }),
      prisma.school_wishlist.findMany({
        where: { student_id: studentId },
        orderBy: { sort_order: "asc" },
        include: { university_rankings: { select: { name: true } } },
        take: 5,
      }),
    ]);

    const wishlist_faculties = facultyWishlist.map((r) => r.faculty_name).filter(Boolean);
    const wishlist_universities = schoolWishlist
      .map((r) => r.university_rankings?.name)
      .filter((n): n is string => Boolean(n));

    if (wishlist_faculties.length === 0 || wishlist_universities.length === 0) {
      return NextResponse.json(
        {
          error:
            "Bạn cần chọn ít nhất 1 ngành trong wishlist ngành và ít nhất 1 trường trong wishlist trường trước khi chạy đánh giá. Vào Hồ sơ để thêm.",
        },
        { status: 400 }
      );
    }

    function toPillar100(val: number | null | undefined, fallbackScale10?: number | null): number {
      if (val == null) return fallbackScale10 != null ? Math.round(Number(fallbackScale10) * 10) : 70;
      const n = Number(val);
      if (n <= 1) return Math.round(n * 100);
      if (n <= 10 && n > 1) return Math.round(n * 10);
      return Math.round(Math.min(100, Math.max(0, n)));
    }

    const p = latestProfile;
    const pillars = {
      academic: toPillar100(p?.score_aca),
      language: toPillar100(p?.score_lan),
      extracurricular: toPillar100(p?.score_hdnk),
      skills: toPillar100(p?.score_skill),
    };

    /** Map độ sắc (profile analysis) sang T1/T2/T3 cho server-ai */
    function sharpnessToTier(sharp: string): "T1" | "T2" | "T3" {
      const s = String(sharp ?? "").toLowerCase();
      if (/t1|cao|high|exceptional|sharp|mạnh|rất|strong/i.test(s)) return "T1";
      if (/t3|thấp|low|yếu|weak/i.test(s)) return "T3";
      return "T2"; // Med, Medium, Trung bình, hoặc mặc định
    }

    type SpikeItem = { type: string; tier: string };
    let spikes: SpikeItem[] = [];

    function addSpikeFromSection(section: Record<string, unknown> | null | undefined) {
      if (!section || typeof section !== "object") return;
      const mainType = section["Loại Spike hiện tại"] ?? section["Loại spike"];
      const mainSharp = section["Độ sắc (Sharpness)"];
      if (mainType != null || mainSharp != null) {
        const type = String(mainType ?? "general").replace(/\s+/g, "_").toLowerCase();
        const tier = sharpnessToTier(String(mainSharp ?? ""));
        spikes.push({ type, tier });
      }
      const allScores = section["Tất cả Spike Scores"];
      if (allScores && typeof allScores === "object" && !Array.isArray(allScores)) {
        const entries = Object.entries(allScores as Record<string, unknown>);
        for (const [name, detail] of entries) {
          if (!detail || typeof detail !== "object" || spikes.length >= 5) continue;
          const d = detail as Record<string, unknown>;
          const sharp = d.sharpness ?? d["Độ sắc (Sharpness)"];
          const typeName = d.name ?? d["Loại Spike"] ?? name;
          const type = String(typeName).replace(/\s+/g, "_").toLowerCase();
          if (!type) continue;
          const tier = sharpnessToTier(String(sharp ?? ""));
          if (!spikes.some((s) => s.type === type)) spikes.push({ type, tier });
        }
      }
    }

    if (p?.full_result && typeof p.full_result === "object") {
      const spikeSection = (p.full_result as Record<string, unknown>)["C. Nhận diện Spike (Yếu tố cốt lõi)"];
      addSpikeFromSection(spikeSection as Record<string, unknown> | undefined);
    }
    if (spikes.length === 0) {
      spikes = [{ type: "general", tier: "T2" }];
    }
    if (spikes.length > 5) spikes = spikes.slice(0, 5);

    const payload = {
      wishlist_faculties: wishlist_faculties.slice(0, 5),
      wishlist_universities: wishlist_universities.slice(0, 5),
      pillars,
      spikes,
      region_fit: "medium",
      personality_fit: "medium",
    };

    console.log("[admission-chance] Payload to server-ai:", JSON.stringify(payload));

    const rawResult = await callAdmissionChance(payload);

    // Server-ai (FastAPI) đang trả dạng { success, data: { ok, summary, faculties }, error }
    // hoặc có thể trả trực tiếp { ok, summary, faculties }.
    const result =
      rawResult && typeof rawResult === "object" && "data" in rawResult
        ? ((rawResult as { data: { ok: boolean; summary?: unknown; faculties?: unknown } }).data)
        : (rawResult as { ok?: boolean; summary?: unknown; faculties?: unknown } | null);

    if (result?.ok && result.summary != null && result.faculties != null) {
      const faculties = result.faculties as {
        reach?: Array<{ strong_universities?: Array<{ qs_rank?: number }> }>;
        match?: Array<{ strong_universities?: Array<{ qs_rank?: number }> }>;
        safe?: Array<{ strong_universities?: Array<{ qs_rank?: number }> }>;
      };
      const qsRanks = new Set<number>();
      for (const key of ["reach", "match", "safe"] as const) {
        for (const row of faculties[key] ?? []) {
          for (const u of row.strong_universities ?? []) {
            if (typeof u.qs_rank === "number") qsRanks.add(u.qs_rank);
          }
        }
      }
      let qsToId: Record<number, number> = {};
      if (qsRanks.size > 0) {
        const rows = await prisma.university_rankings.findMany({
          where: { qs_rank: { in: Array.from(qsRanks) } },
          select: { id: true, qs_rank: true },
        });
        qsToId = Object.fromEntries(rows.map((r) => [r.qs_rank, r.id]));
      }
      const enrich = (arr: Array<{ strong_universities?: Array<{ qs_rank?: number; name?: string; country?: string; city?: string; region?: string }> }> | undefined) => {
        if (!arr) return;
        for (const row of arr) {
          if (!row.strong_universities) continue;
          for (const u of row.strong_universities) {
            if (typeof u.qs_rank === "number" && qsToId[u.qs_rank] != null) {
              (u as Record<string, unknown>).university_id = qsToId[u.qs_rank];
            }
          }
        }
      };
      enrich(faculties.reach);
      enrich(faculties.match);
      enrich(faculties.safe);

      try {
        await prisma.admission_chance_results.create({
          data: {
            id: randomUUID(),
            student_id: studentId,
            summary: typeof result.summary === "object" ? result.summary : {},
            faculties: result.faculties as object,
          },
        });
      } catch (dbErr) {
        console.error("[admission-chance] Lưu DB thất bại:", dbErr);
      }
    }

    if (result && typeof result === "object" && "ok" in result) {
      return NextResponse.json(result, { status: 200 });
    }

    const errMsg = (result as { error?: string })?.error ?? "Không nhận được kết quả từ server.";
    return NextResponse.json({ ok: false, error: errMsg }, { status: 502 });
  } catch (e) {
    console.error("[admission-chance]", e);
    const message = e instanceof Error ? e.message : "Lỗi khi gọi đánh giá cơ hội trúng tuyển.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
