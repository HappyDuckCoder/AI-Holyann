import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-config";
import { prisma } from "@/lib/prisma";

/** GET: Lấy mục tiêu đã thiết lập (nếu có). */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ student_id: string }> }
) {
  const { student_id: studentId } = await context.params;
  const session = await getServerSession(authOptions);
  const sessionUserId = (session?.user as { id?: string })?.id ?? (session?.user as { user_id?: string })?.user_id;
  if (!sessionUserId || String(sessionUserId) !== String(studentId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const student = await prisma.students.findUnique({
      where: { user_id: studentId },
      select: {
        target_faculty_name: true,
        target_university_id: true,
        target_university_name: true,
        target_set_at: true,
      },
    });

    if (!student) {
      return NextResponse.json({
        target_faculty_name: null,
        target_university_id: null,
        target_university_name: null,
        target_set_at: null,
        already_set: false,
      });
    }

    const already_set = student.target_set_at != null;
    return NextResponse.json({
      target_faculty_name: student.target_faculty_name ?? null,
      target_university_id: student.target_university_id ?? null,
      target_university_name: student.target_university_name ?? null,
      target_set_at: student.target_set_at?.toISOString() ?? null,
      already_set,
    });
  } catch (e) {
    console.error("[target-goal] GET error:", e);
    return NextResponse.json({ error: "Lỗi tải mục tiêu" }, { status: 500 });
  }
}

/** PATCH: Thiết lập mục tiêu (chỉ được 1 lần). */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ student_id: string }> }
) {
  const { student_id: studentId } = await context.params;
  const session = await getServerSession(authOptions);
  const sessionUserId = (session?.user as { id?: string })?.id ?? (session?.user as { user_id?: string })?.user_id;
  if (!sessionUserId || String(sessionUserId) !== String(studentId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { faculty_name?: string; university_id?: number; university_name?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { faculty_name, university_id, university_name } = body;
  if (!faculty_name || !university_name) {
    return NextResponse.json(
      { error: "Cần chọn ngành và tên trường" },
      { status: 400 }
    );
  }

  try {
    const student = await prisma.students.findUnique({
      where: { user_id: studentId },
      select: { target_set_at: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Không tìm thấy hồ sơ" }, { status: 404 });
    }

    if (student.target_set_at != null) {
      return NextResponse.json(
        { error: "Bạn đã thiết lập mục tiêu trước đó. Chỉ được thiết lập một lần duy nhất." },
        { status: 403 }
      );
    }

    await prisma.students.update({
      where: { user_id: studentId },
      data: {
        target_faculty_name: faculty_name,
        target_university_id: university_id ?? null,
        target_university_name: university_name,
        target_set_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      target_faculty_name: faculty_name,
      target_university_id: university_id ?? null,
      target_university_name: university_name,
    });
  } catch (e) {
    console.error("[target-goal] PATCH error:", e);
    return NextResponse.json({ error: "Lỗi lưu mục tiêu" }, { status: 500 });
  }
}
