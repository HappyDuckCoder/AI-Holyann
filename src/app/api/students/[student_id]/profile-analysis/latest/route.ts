import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ student_id: string }> }
) {
  const { student_id: studentId } = await context.params;
  try {
    const [analysis, enhance] = await Promise.all([
      prisma.profile_analyses.findFirst({
        where: { student_id: studentId },
        orderBy: { analysis_date: "desc" },
        select: { id: true, full_result: true, input_data: true, analysis_date: true },
      }),
      prisma.profile_improve_results.findFirst({
        where: { student_id: studentId },
        orderBy: { created_at: "desc" },
        select: { id: true, enhance_result: true, enhance_at: true },
      }),
    ]);

    return NextResponse.json({
      analysis: analysis
        ? {
            id: analysis.id,
            full_result: analysis.full_result,
            input_data: analysis.input_data,
            analysis_date: analysis.analysis_date,
          }
        : null,
      enhance: enhance
        ? {
            id: enhance.id,
            enhance_result: enhance.enhance_result,
            enhance_at: enhance.enhance_at,
          }
        : null,
    });
  } catch {
    return NextResponse.json({ error: "Lỗi tải dữ liệu" }, { status: 500 });
  }
}
