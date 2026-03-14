import { NextResponse } from "next/server";
import { buildProfilePayloadFromDb } from "@/lib/build-profile-payload";

export async function GET(
  _request: Request,
  context: { params: Promise<{ student_id: string }> }
) {
  const { student_id: studentId } = await context.params;
  try {
    const payload = await buildProfilePayloadFromDb(studentId);
    if (!payload) {
      return NextResponse.json({ error: "Không tìm thấy học sinh" }, { status: 404 });
    }
    return NextResponse.json(payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Lỗi build payload";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
