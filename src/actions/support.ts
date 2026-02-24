"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-config";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";
import type { SupportRequestInput, SupportRequestResult } from "@/types/support";

// ============================================================
// ZOD VALIDATION SCHEMA
// ============================================================

const SupportRequestSchema = z.object({
  description: z
    .string()
    .min(1, "Mô tả không được để trống")
    .max(5000, "Mô tả không được vượt quá 5000 ký tự"),
  imageUrl: z.string().url("URL hình ảnh không hợp lệ").nullable().optional(),
});


// ============================================================
// SERVER ACTIONS
// ============================================================

/**
 * Gửi yêu cầu hỗ trợ/feedback từ học viên
 */
export async function submitSupportRequest(
  data: SupportRequestInput
): Promise<SupportRequestResult> {
  try {
    // 1. Kiểm tra session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    const studentId = session.user.id;

    // 2. Validate dữ liệu bằng Zod
    const validationResult = SupportRequestSchema.safeParse(data);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Dữ liệu không hợp lệ",
      };
    }

    const { description, imageUrl } = validationResult.data;

    // 3. Lưu vào database
    const supportRequest = await prisma.support_requests.create({
      data: {
        student_id: studentId,
        description: description,
        image_url: imageUrl || null,
        status: "PENDING",
      },
    });

    console.log("[Support] Request created:", {
      id: supportRequest.id,
      studentId,
    });

    // 4. Return kết quả thành công
    return {
      success: true,
      message: "Gửi yêu cầu thành công",
      data: {
        id: supportRequest.id,
        created_at: supportRequest.created_at,
      },
    };
  } catch (error) {
    console.error("[Support] Error:", error);

    if (error instanceof Error) {
      return { success: false, error: `Lỗi: ${error.message}` };
    }

    return { success: false, error: "Lỗi không xác định khi gửi yêu cầu" };
  }
}

/**
 * Lấy danh sách yêu cầu hỗ trợ của học viên hiện tại
 */
export async function getStudentSupportRequests(): Promise<{
  success: boolean;
  error?: string;
  data: Array<{
    id: string;
    description: string;
    image_url: string | null;
    status: string;
    created_at: Date;
  }>;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Bạn chưa đăng nhập", data: [] };
    }

    const requests = await prisma.support_requests.findMany({
      where: { student_id: session.user.id },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        description: true,
        image_url: true,
        status: true,
        created_at: true,
      },
    });

    return { success: true, data: requests };
  } catch (error) {
    console.error("[Support] Error fetching requests:", error);
    return {
      success: false,
      error: "Không thể tải danh sách yêu cầu",
      data: [],
    };
  }
}

/**
 * [ADMIN] Lấy tất cả yêu cầu hỗ trợ (dành cho Admin)
 */
export async function getAllSupportRequests(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  success: boolean;
  error?: string;
  data: Array<{
    id: string;
    description: string;
    image_url: string | null;
    status: string;
    created_at: Date;
    student: {
      id: string;
      full_name: string;
      email: string;
      avatar_url: string | null;
    };
  }>;
  total: number;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Bạn chưa đăng nhập", data: [], total: 0 };
    }

    // Kiểm tra quyền Admin
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return {
        success: false,
        error: "Bạn không có quyền truy cập",
        data: [],
        total: 0,
      };
    }

    const { status, limit = 20, offset = 0 } = params || {};

    const whereClause = status ? { status } : {};

    const [requests, total] = await Promise.all([
      prisma.support_requests.findMany({
        where: whereClause,
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          description: true,
          image_url: true,
          status: true,
          created_at: true,
          student: {
            select: {
              id: true,
              full_name: true,
              email: true,
              avatar_url: true,
            },
          },
        },
      }),
      prisma.support_requests.count({ where: whereClause }),
    ]);

    return { success: true, data: requests, total };
  } catch (error) {
    console.error("[Support] Error fetching all requests:", error);
    return {
      success: false,
      error: "Không thể tải danh sách yêu cầu",
      data: [],
      total: 0,
    };
  }
}

/**
 * [ADMIN] Cập nhật trạng thái yêu cầu hỗ trợ
 */
export async function updateSupportRequestStatus(
  requestId: string,
  status: string
): Promise<SupportRequestResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    // Kiểm tra quyền Admin
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return { success: false, error: "Bạn không có quyền thực hiện" };
    }

    // Validate status
    const validStatuses = ["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    if (!validStatuses.includes(status)) {
      return { success: false, error: "Trạng thái không hợp lệ" };
    }

    await prisma.support_requests.update({
      where: { id: requestId },
      data: { status },
    });

    return { success: true, message: "Cập nhật trạng thái thành công" };
  } catch (error) {
    console.error("[Support] Error updating status:", error);
    return { success: false, error: "Không thể cập nhật trạng thái" };
  }
}

/**
 * Upload ảnh hỗ trợ lên Supabase Storage (server-side, bypass RLS)
 */
export async function uploadSupportImage(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "Không tìm thấy file" };
    }

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: "Chỉ hỗ trợ file PNG, JPG, WEBP" };
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "File vượt quá 5MB" };
    }

    const timestamp = Date.now();
    const cleanFileName = file.name
      .replace(/[^a-zA-Z0-9.]/g, "_")
      .toLowerCase();
    const filePath = `support/${session.user.id}/${timestamp}_${cleanFileName}`;

    // Convert File to Buffer for server-side upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("hoex-documents")
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("[Support] Upload error:", uploadError);
      return { success: false, error: `Upload thất bại: ${uploadError.message}` };
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("hoex-documents")
      .getPublicUrl(filePath);

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error("[Support] Upload error:", error);
    return { success: false, error: "Lỗi khi upload ảnh" };
  }
}

