import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ student_id: string }> }
) {
  const { student_id: studentId } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    const sessionUserId = (session?.user as { id?: string })?.id ?? (session?.user as { user_id?: string })?.user_id;
    if (!sessionUserId || String(sessionUserId) !== String(studentId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const latest = await prisma.admission_chance_results.findFirst({
      where: { student_id: studentId },
      orderBy: { created_at: "desc" },
      select: { id: true, summary: true, faculties: true, created_at: true },
    });

    if (!latest) {
      return NextResponse.json({ result: null }, { status: 200 });
    }

    return NextResponse.json({
      result: {
        summary: latest.summary as object,
        faculties: latest.faculties as object,
        created_at: latest.created_at?.toISOString() ?? null,
      },
    });
  } catch (e) {
    console.error("[admission-chance/latest]", e);
    return NextResponse.json({ error: "Lỗi tải kết quả" }, { status: 500 });
  }
}
