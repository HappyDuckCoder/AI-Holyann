"use server";

import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-config";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// ============================================================
// GOOGLE SERVICE ACCOUNT AUTHENTICATION
// ============================================================

const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";

// ============================================================
// NODEMAILER CONFIGURATION
// ============================================================

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

/**
 * Tạo Nodemailer transporter
 */
function getEmailTransporter() {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn("[Email] Missing EMAIL_USER or EMAIL_PASS in .env");
    return null;
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

/**
 * Tạo JWT Auth từ Service Account
 */
function getGoogleAuth() {
  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error(
      "Missing Google Service Account credentials. Please check GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in .env"
    );
  }

  const auth = new google.auth.JWT({
    email: GOOGLE_CLIENT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/calendar.events"],
  });

  return auth;
}

// ============================================================
// DATA TYPES
// ============================================================

export interface CreateMeetingInput {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  mentorEmail: string;
  studentEmail: string;
  isCreateMeet?: boolean;
}

export interface CreateMeetingResult {
  success: boolean;
  meetLink?: string | null;
  eventId?: string;
  error?: string;
  emailSent?: boolean;
}

// ============================================================
// EMAIL TEMPLATE
// ============================================================

function generateMeetingInviteEmail(params: {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  meetLink: string | null;
  mentorName?: string;
}): string {
  const { title, description, startTime, endTime, meetLink, mentorName } = params;

  const formattedStartTime = format(new Date(startTime), "EEEE, dd/MM/yyyy 'lúc' HH:mm", {
    locale: vi,
  });
  const formattedEndTime = format(new Date(endTime), "HH:mm", { locale: vi });

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thư mời tư vấn - HOEX</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 40px; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                📅 Thư mời buổi tư vấn
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Holy Explore - Nền tảng du học thông minh
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a2e; font-size: 20px; font-weight: 600;">
                ${title}
              </h2>
              
              <!-- Time Box -->
              <div style="background-color: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #4a5568; font-size: 14px;">
                  <strong style="color: #667eea;">🕐 Thời gian:</strong>
                </p>
                <p style="margin: 8px 0 0 0; color: #1a1a2e; font-size: 16px; font-weight: 500;">
                  ${formattedStartTime} - ${formattedEndTime}
                </p>
              </div>
              
              ${mentorName ? `
              <!-- Mentor Info -->
              <div style="background-color: #fff8f0; border-left: 4px solid #f6ad55; padding: 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #4a5568; font-size: 14px;">
                  <strong style="color: #dd6b20;">👨‍🏫 Mentor:</strong>
                </p>
                <p style="margin: 8px 0 0 0; color: #1a1a2e; font-size: 16px; font-weight: 500;">
                  ${mentorName}
                </p>
              </div>
              ` : ''}
              
              ${description ? `
              <!-- Description -->
              <div style="margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; color: #4a5568; font-size: 14px;">
                  <strong>📝 Nội dung:</strong>
                </p>
                <p style="margin: 0; color: #4a5568; font-size: 14px; line-height: 1.6;">
                  ${description}
                </p>
              </div>
              ` : ''}
              
              ${meetLink ? `
              <!-- Google Meet Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${meetLink}" 
                   target="_blank"
                   style="display: inline-block; background: linear-gradient(135deg, #00c853 0%, #00e676 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(0, 200, 83, 0.4);">
                  🎥 Tham gia Google Meet
                </a>
              </div>
              <p style="text-align: center; color: #718096; font-size: 12px; margin-top: 8px;">
                Hoặc copy link: <a href="${meetLink}" style="color: #667eea;">${meetLink}</a>
              </p>
              ` : `
              <div style="text-align: center; margin: 32px 0; padding: 20px; background-color: #f7fafc; border-radius: 8px;">
                <p style="margin: 0; color: #718096; font-size: 14px;">
                  📍 Thông tin địa điểm sẽ được thông báo sau
                </p>
              </div>
              `}
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 24px 40px; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #718096; font-size: 12px; text-align: center;">
                Email này được gửi tự động từ hệ thống <strong>HOEX - Holy Explore</strong>.<br>
                Vui lòng không trả lời email này.
              </p>
              <p style="margin: 12px 0 0 0; color: #a0aec0; font-size: 11px; text-align: center;">
                © 2026 Holy Explore. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// ============================================================
// SERVER ACTIONS
// ============================================================

/**
 * Tạo buổi tư vấn trên Google Calendar và lưu vào Database
 */
export async function createConsultationEvent(
  data: CreateMeetingInput
): Promise<CreateMeetingResult> {
  try {
    // 1. Kiểm tra session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    // 2. Lấy thông tin mentor từ database
    const mentor = await prisma.users.findUnique({
      where: { id: session.user.id },
      include: { mentor_profile: true },
    });

    if (!mentor || mentor.role !== "MENTOR") {
      return { success: false, error: "Chỉ mentor mới có quyền tạo lịch tư vấn" };
    }

    // 3. Khởi tạo Google Auth
    const auth = getGoogleAuth();
    const calendar = google.calendar({ version: "v3", auth });

    // 4. Chuẩn bị event data
    const {
      title,
      description = "",
      startTime,
      endTime,
      mentorEmail,
      studentEmail,
      isCreateMeet = true,
    } = data;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventData: any = {
      summary: title,
      description: `${description}\n\n---\nMentor: ${mentor.full_name} (${mentorEmail})\nHọc viên: ${studentEmail}`,
      start: {
        dateTime: new Date(startTime).toISOString(),
        timeZone: "Asia/Ho_Chi_Minh",
      },
      end: {
        dateTime: new Date(endTime).toISOString(),
        timeZone: "Asia/Ho_Chi_Minh",
      },
      // QUAN TRỌNG: Thêm cấu hình yêu cầu Google tạo link Meet

    };

    // 6. Gọi Google Calendar API để tạo event
    console.log("[Calendar] Creating event:", { title, startTime, endTime });

    const response = await calendar.events.insert({
      calendarId: GOOGLE_CALENDAR_ID,
      requestBody: eventData,
    });

    const createdEvent = response.data;

    // Rút xuất link Meet trực tiếp từ Google trả về
      const meetLink = null;
      const eventId = response.data.id || "";

    console.log("[Calendar] Event created:", { eventId, meetLink });

    // 7. Lưu vào database
    await prisma.consultation_meetings.create({
      data: {
        id: uuidv4(),
        title: title,
        description: description,
        mentor_id: session.user.id,
        mentor_email: mentorEmail,
        student_email: studentEmail,
        start_time: new Date(startTime),
        end_time: new Date(endTime),
        meet_link: meetLink,
        google_event_id: eventId,
      },
    });

    // 8. Gửi email thông báo qua Nodemailer
    let emailSent = false;
    const transporter = getEmailTransporter();

    if (transporter) {
      try {
        const emailHtml = generateMeetingInviteEmail({
          title,
          description,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          meetLink,
          mentorName: mentor.full_name,
        });

        await transporter.sendMail({
          from: `"HOEX - Holy Explore" <${EMAIL_USER}>`,
          to: studentEmail,
          cc: mentorEmail,
          subject: `[HOEX] Thư mời tư vấn: ${title}`,
          html: emailHtml,
        });

        emailSent = true;
        console.log("[Email] Sent to:", studentEmail);
      } catch (emailError) {
        console.error("[Email] Failed:", emailError);
      }
    }

    return { success: true, meetLink, eventId, emailSent };
  } catch (error) {
    console.error("[Calendar] Error:", error);

    if (error instanceof Error) {
      const msg = error.message;
      if (msg.includes("invalid_grant")) return { success: false, error: "Service Account không hợp lệ" };
      if (msg.includes("accessNotConfigured")) return { success: false, error: "Google Calendar API chưa bật" };
      if (msg.includes("insufficientPermissions")) return { success: false, error: "Không có quyền truy cập Calendar" };
      if (msg.includes("notFound")) return { success: false, error: "Calendar không tồn tại hoặc chưa share quyền" };
      return { success: false, error: `Lỗi: ${msg}` };
    }

    return { success: false, error: "Lỗi không xác định" };
  }
}

/**
 * Lấy danh sách các buổi tư vấn của mentor
 */
export async function getMentorMeetings() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Bạn chưa đăng nhập", data: [] };
    }

    const meetings = await prisma.consultation_meetings.findMany({
      where: { mentor_id: session.user.id },
      orderBy: { start_time: "desc" },
    });

    return { success: true, data: meetings };
  } catch (error) {
    console.error("[Calendar] Error fetching meetings:", error);
    return { success: false, error: "Không thể tải danh sách cuộc họp", data: [] };
  }
}

/**
 * Lấy danh sách các buổi tư vấn sắp tới của học viên
 */
export async function getStudentMeetings(studentEmail: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Bạn chưa đăng nhập", data: [] };
    }

    const meetings = await prisma.consultation_meetings.findMany({
      where: {
        student_email: studentEmail,
        start_time: { gte: new Date() },
      },
      orderBy: { start_time: "asc" },
      include: {
        mentor: {
          select: { full_name: true, email: true, avatar_url: true },
        },
      },
    });

    return { success: true, data: meetings };
  } catch (error) {
    console.error("[Calendar] Error:", error);
    return { success: false, error: "Không thể tải danh sách", data: [] };
  }
}

/**
 * Xóa buổi tư vấn
 */
export async function deleteMeeting(meetingId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    const meeting = await prisma.consultation_meetings.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) return { success: false, error: "Không tìm thấy cuộc họp" };
    if (meeting.mentor_id !== session.user.id) return { success: false, error: "Không có quyền xóa" };

    // Xóa trên Google Calendar
    if (meeting.google_event_id) {
      try {
        const auth = getGoogleAuth();
        const calendar = google.calendar({ version: "v3", auth });
        await calendar.events.delete({
          calendarId: GOOGLE_CALENDAR_ID,
          eventId: meeting.google_event_id,
        });
      } catch (e) {
        console.error("[Calendar] Delete error:", e);
      }
    }

    await prisma.consultation_meetings.delete({ where: { id: meetingId } });

    return { success: true };
  } catch (error) {
    console.error("[Calendar] Error:", error);
    return { success: false, error: "Không thể xóa cuộc họp" };
  }
}
