"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-config";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import { format, addMinutes } from "date-fns";
import { vi } from "date-fns/locale";
import { handleServerError } from "@/lib/handle-error";

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

// ============================================================
// DATA TYPES
// ============================================================

export interface CreateMeetingInput {
  content: string;
  startTime: Date;
  durationMinutes: number; // Thời lượng cuộc họp (phút)
  studentId: string; // UUID của học viên
  mentorEmail: string;
}

export interface CreateMeetingResult {
  success: boolean;
  meetLink?: string;
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
  meetLink: string;
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
              
              <!-- Daily.co Meet Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${meetLink}" 
                   target="_blank"
                   style="display: inline-block; background: linear-gradient(135deg, #1e88e5 0%, #42a5f5 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(30, 136, 229, 0.4);">
                  🎥 Tham gia phòng họp
                </a>
              </div>
              <p style="text-align: center; color: #718096; font-size: 12px; margin-top: 8px;">
                Hoặc copy link: <a href="${meetLink}" style="color: #667eea;">${meetLink}</a>
              </p>
              
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

function generateMeetingUpdateEmail(params: {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  meetLink: string;
  mentorName?: string;
}): string {
  const { title, description, startTime, endTime, meetLink, mentorName } = params;

  const formattedStartTime = format(new Date(startTime), "EEEE, dd/MM/yyyy 'lúc' HH:mm", { locale: vi });
  const formattedEndTime = format(new Date(endTime), "HH:mm", { locale: vi });

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cập nhật lịch tư vấn - HOEX</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f6a623 0%, #f05a28 100%); padding: 30px 40px; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                🔔 Lịch tư vấn đã được cập nhật
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Holy Explore - Nền tảng du học thông minh
              </p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 15px;">
                Thông tin buổi tư vấn của bạn đã được thay đổi. Vui lòng kiểm tra lịch mới bên dưới.
              </p>
              <h2 style="margin: 0 0 20px 0; color: #1a1a2e; font-size: 20px; font-weight: 600;">
                ${title}
              </h2>
              <!-- Time Box -->
              <div style="background-color: #fff8f0; border-left: 4px solid #f6a623; padding: 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #4a5568; font-size: 14px;">
                  <strong style="color: #f05a28;">🕐 Thời gian mới:</strong>
                </p>
                <p style="margin: 8px 0 0 0; color: #1a1a2e; font-size: 16px; font-weight: 500;">
                  ${formattedStartTime} - ${formattedEndTime}
                </p>
              </div>
              ${mentorName ? `
              <div style="background-color: #f0f7ff; border-left: 4px solid #667eea; padding: 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #4a5568; font-size: 14px;"><strong style="color: #667eea;">👨‍🏫 Mentor:</strong></p>
                <p style="margin: 8px 0 0 0; color: #1a1a2e; font-size: 16px; font-weight: 500;">${mentorName}</p>
              </div>` : ''}
              ${description ? `
              <div style="margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; color: #4a5568; font-size: 14px;"><strong>📝 Nội dung:</strong></p>
                <p style="margin: 0; color: #4a5568; font-size: 14px; line-height: 1.6;">${description}</p>
              </div>` : ''}
              <!-- Meet Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${meetLink}" target="_blank"
                   style="display: inline-block; background: linear-gradient(135deg, #1e88e5 0%, #42a5f5 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(30,136,229,0.4);">
                  🎥 Tham gia phòng họp
                </a>
              </div>
              <p style="text-align: center; color: #718096; font-size: 12px; margin-top: 8px;">
                Hoặc copy link: <a href="${meetLink}" style="color: #667eea;">${meetLink}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 24px 40px; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #718096; font-size: 12px; text-align: center;">
                Email này được gửi tự động từ hệ thống <strong>HOEX - Holy Explore</strong>.<br>Vui lòng không trả lời email này.
              </p>
              <p style="margin: 12px 0 0 0; color: #a0aec0; font-size: 11px; text-align: center;">© 2026 Holy Explore. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function generateMeetingCancelEmail(params: {
  title: string;
  startTime: Date;
  mentorName?: string;
}): string {
  const { title, startTime, mentorName } = params;
  const formattedStartTime = format(new Date(startTime), "EEEE, dd/MM/yyyy 'lúc' HH:mm", { locale: vi });

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hủy lịch tư vấn - HOEX</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%); padding: 30px 40px; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                ❌ Lịch tư vấn đã bị hủy
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Holy Explore - Nền tảng du học thông minh
              </p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 15px;">
                Rất tiếc, buổi tư vấn dưới đây đã bị hủy. Vui lòng liên hệ với mentor để sắp xếp lịch mới nếu cần thiết.
              </p>
              <h2 style="margin: 0 0 20px 0; color: #1a1a2e; font-size: 20px; font-weight: 600; text-decoration: line-through; color: #718096;">
                ${title}
              </h2>
              <!-- Time Box -->
              <div style="background-color: #fff5f5; border-left: 4px solid #e53e3e; padding: 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #4a5568; font-size: 14px;">
                  <strong style="color: #e53e3e;">🕐 Thời gian dự kiến (đã hủy):</strong>
                </p>
                <p style="margin: 8px 0 0 0; color: #718096; font-size: 16px; font-weight: 500; text-decoration: line-through;">
                  ${formattedStartTime}
                </p>
              </div>
              ${mentorName ? `
              <div style="background-color: #f7fafc; border-left: 4px solid #cbd5e0; padding: 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #4a5568; font-size: 14px;"><strong>👨‍🏫 Mentor:</strong></p>
                <p style="margin: 8px 0 0 0; color: #1a1a2e; font-size: 16px; font-weight: 500;">${mentorName}</p>
              </div>` : ''}
              <div style="background-color: #ebf8ff; border: 1px solid #bee3f8; padding: 16px 20px; border-radius: 8px; margin-top: 8px;">
                <p style="margin: 0; color: #2b6cb0; font-size: 14px;">
                  💡 <strong>Gợi ý:</strong> Bạn có thể nhắn tin trực tiếp cho mentor qua hệ thống chat của HOEX để đặt lịch mới.
                </p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 24px 40px; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #718096; font-size: 12px; text-align: center;">
                Email này được gửi tự động từ hệ thống <strong>HOEX - Holy Explore</strong>.<br>Vui lòng không trả lời email này.
              </p>
              <p style="margin: 12px 0 0 0; color: #a0aec0; font-size: 11px; text-align: center;">© 2026 Holy Explore. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ============================================================
// SERVER ACTIONS
// ============================================================

/**
 * Lấy danh sách học viên được phân công cho mentor hiện tại
 */
export async function getAssignedStudentsForMentor() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Bạn chưa đăng nhập", data: [] };
    }

    const assignments = await prisma.mentor_assignments.findMany({
      where: {
        mentor_id: session.user.id,
        status: "ACTIVE",
      },
      include: {
        students: {
          include: {
            users: {
              select: {
                id: true,
                full_name: true,
                email: true,
                avatar_url: true,
              },
            },
          },
        },
      },
    });

    const students = assignments
      .filter((a) => a.students?.users)
      .map((a) => ({
        id: a.students.users.id,
        full_name: a.students.users.full_name,
        email: a.students.users.email,
        avatar_url: a.students.users.avatar_url,
      }));

    // Loại bỏ trùng lặp (1 học viên có thể được assign nhiều type)
    const uniqueStudents = Array.from(
      new Map(students.map((s) => [s.id, s])).values()
    );

    return { success: true, data: uniqueStudents };
  } catch (error) {
    console.error("[Meeting] Error fetching assigned students:", error);
    return { success: false, error: "Không thể tải danh sách học viên", data: [] };
  }
}

/**
 * Tạo buổi tư vấn với Daily.co và lưu vào Database
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
      include: { mentors: true },
    });

    if (!mentor || mentor.role !== "MENTOR") {
      return { success: false, error: "Chỉ mentor mới có quyền tạo lịch tư vấn" };
    }

    // 3. Lấy thông tin học viên từ studentId
    const student = await prisma.users.findUnique({
      where: { id: data.studentId },
      select: { id: true, full_name: true, email: true },
    });

    if (!student) {
      return { success: false, error: "Không tìm thấy học viên" };
    }

    const studentEmail = student.email;
    const studentName = student.full_name;

    // 3. Tính end_time sử dụng addMinutes
    const startTime = new Date(data.startTime);
    const duration = data.durationMinutes || 60;
    const endTime = addMinutes(startTime, duration);

    // Daily.co exp phải là Unix timestamp (giây) trong tương lai
    const nowSec = Math.floor(Date.now() / 1000);
    const endTimeSec = Math.floor(endTime.getTime() / 1000);
    const expSec = Math.max(endTimeSec, nowSec + 3600); // ít nhất 1 giờ từ bây giờ

    // 4. Tạo phòng Daily.co
    const DAILY_API_KEY = process.env.DAILY_API_KEY;
    if (!DAILY_API_KEY) {
      return { success: false, error: "Thiếu DAILY_API_KEY trong .env" };
    }

    let roomUrl = "";
    let roomName = "";
    let hostLink = "";

    try {
      // 4a. Tạo Room
      const roomRes = await fetch("https://api.daily.co/v1/rooms", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${DAILY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: {
            exp: expSec,
            enable_prejoin_ui: true, // Bật màn hình chờ chuẩn bị trước khi vào
            enable_screenshare: true, // Cho phép chia sẻ màn hình
            enable_chat: true, // Bật chat cơ bản
            enable_advanced_chat: true, // Bật chat nâng cao (gửi file, reply)
            enable_hand_raising: true, // Bật tính năng giơ tay
            enable_emoji_reactions: true, // Bật thả biểu tượng cảm xúc
            enable_noise_cancellation_ui: true, // Bật nút lọc tiếng ồn AI
            enable_video_processing_ui: true, // Cho phép làm mờ/đổi phông nền
            enable_pip_ui: true, // Cho phép thu nhỏ màn hình (Picture-in-Picture)
            enable_recording: "cloud", // Bật tính năng ghi hình trên Cloud
          },
        }),
      });

      if (!roomRes.ok) {
        const errBody = await roomRes.text();
        console.error("[Daily.co] Room creation failed:", errBody);
        return { success: false, error: "Không thể tạo phòng họp Daily.co" };
      }

      const roomData = await roomRes.json();
      roomUrl = roomData.url; // e.g. https://your-domain.daily.co/room-name
      roomName = roomData.name;

      console.log("[Daily.co] Room created:", { roomUrl, roomName });

      // 4b. Tạo Meeting Token cho Host (Owner)
      const tokenRes = await fetch("https://api.daily.co/v1/meeting-tokens", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${DAILY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: {
            room_name: roomName,
            is_owner: true,
          },
        }),
      });

      if (!tokenRes.ok) {
        const errBody = await tokenRes.text();
        console.error("[Daily.co] Token creation failed:", errBody);
        // Vẫn tiếp tục, mentor sẽ dùng link thường
        hostLink = roomUrl;
      } else {
        const tokenData = await tokenRes.json();
        hostLink = `${roomUrl}?t=${tokenData.token}`;
        console.log("[Daily.co] Host token created");
      }
    } catch (dailyError) {
      console.error("[Daily.co] API Error:", dailyError);
      return { success: false, error: "Lỗi kết nối Daily.co API" };
    }

    console.log("[Meeting] Creating with Daily.co:", {
      content: data.content,
      roomUrl,
      hostLink,
      duration,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    });

    // 5. Lưu vào database
    await prisma.consultation_meetings.create({
      data: {
        id: uuidv4(),
        title: data.content,
        description: data.content,
        mentor_id: session.user.id,
        student_id: data.studentId,
        mentor_email: data.mentorEmail,
        student_email: studentEmail,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: duration,
        meet_link: roomUrl, // Link cho Học viên
        host_meet_link: hostLink, // Link cho Mentor (có token owner)
        google_event_id: null,
      },
    });

    // 6. Gửi email thông báo qua Nodemailer
    let emailSent = false;
    const transporter = getEmailTransporter();

    if (transporter) {
      try {
        // Email cho Học viên (link thường)
        const studentEmailHtml = generateMeetingInviteEmail({
          title: data.content,
          description: data.content,
          startTime: startTime,
          endTime: endTime,
          meetLink: roomUrl,
          mentorName: mentor.full_name,
        });

        await transporter.sendMail({
          from: `"HOEX - Holy Explore" <${EMAIL_USER}>`,
          to: studentEmail,
          subject: `[HOEX] Thư mời tư vấn: ${data.content}`,
          html: studentEmailHtml,
        });

        // Email cho Mentor (link Host với quyền Owner)
        const mentorEmailHtml = generateMeetingInviteEmail({
          title: `[Host] ${data.content}`,
          description: data.content,
          startTime: startTime,
          endTime: endTime,
          meetLink: hostLink,
          mentorName: mentor.full_name,
        });

        await transporter.sendMail({
          from: `"HOEX - Holy Explore" <${EMAIL_USER}>`,
          to: data.mentorEmail,
          subject: `[HOEX] Bạn là Host: ${data.content}`,
          html: mentorEmailHtml,
        });

        emailSent = true;
        console.log("[Email] Sent to student:", studentEmail);
        console.log("[Email] Sent to mentor:", data.mentorEmail);
      } catch (emailError) {
        console.error("[Email] Failed:", emailError);
      }
    }

    return { success: true, meetLink: roomUrl, emailSent };
  } catch (error) {
    return { success: false, error: handleServerError(error) };
  }
}

/**
 * Lấy danh sách TẤT CẢ buổi tư vấn của mentor (bao gồm cả quá khứ & sắp tới)
 */
export async function getMentorMeetings() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Bạn chưa đăng nhập", data: [] };
    }

    const meetings = await prisma.consultation_meetings.findMany({
      where: {
        mentor_id: session.user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        student_id: true,
        student_email: true,
        mentor_email: true,
        start_time: true,
        end_time: true,
        duration_minutes: true,
        meet_link: true,
        host_meet_link: true,
        created_at: true,
        student_user: {
          select: { id: true, full_name: true, avatar_url: true },
        },
      },
      orderBy: { start_time: "asc" },
    });

    return { success: true, data: meetings };
  } catch (error) {
    console.error("[Meeting] Error fetching meetings:", error);
    return { success: false, error: "Không thể tải danh sách cuộc họp", data: [] };
  }
}

/**
 * Lấy TẤT CẢ buổi tư vấn của mentor (bao gồm cả quá khứ)
 */
export async function getAllMentorMeetings() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Bạn chưa đăng nhập", data: [] };
    }

    const meetings = await prisma.consultation_meetings.findMany({
      where: { mentor_id: session.user.id },
      select: {
        id: true,
        title: true,
        description: true,
        student_id: true,
        student_email: true,
        mentor_email: true,
        start_time: true,
        end_time: true,
        duration_minutes: true,
        meet_link: true,
        host_meet_link: true,
        created_at: true,
        student_user: {
          select: { id: true, full_name: true, avatar_url: true },
        },
      },
      orderBy: { start_time: "desc" },
    });

    return { success: true, data: meetings };
  } catch (error) {
    console.error("[Meeting] Error fetching meetings:", error);
    return { success: false, error: "Không thể tải danh sách cuộc họp", data: [] };
  }
}

/**
 * Lấy meetings của mentor trong khoảng thời gian (để hiển thị lên calendar)
 */
export async function getMentorMeetingsInRange(start: Date, end: Date) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Bạn chưa đăng nhập", data: [] };
    }
    const meetings = await prisma.consultation_meetings.findMany({
      where: {
        mentor_id: session.user.id,
        start_time: { gte: start, lte: end },
      },
      orderBy: { start_time: "asc" },
      include: {
        student_user: {
          select: { id: true, full_name: true, email: true, avatar_url: true },
        },
      },
    });
    return { success: true, data: meetings };
  } catch (error) {
    console.error("[Meeting] getMentorMeetingsInRange Error:", error);
    return { success: false, error: "Không thể tải lịch", data: [] };
  }
}

/**
 * Lấy danh sách các buổi tư vấn sắp tới của học viên
 */
export async function getStudentMeetings() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Bạn chưa đăng nhập", data: [] };
    }

    // Lấy email của user hiện tại để fallback cho record cũ
    const currentUser = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    const meetings = await prisma.consultation_meetings.findMany({
      where: {
        OR: [
          { student_id: session.user.id },
          ...(currentUser?.email ? [{ student_email: currentUser.email }] : []),
        ],
        start_time: { gte: new Date() },
      },
      orderBy: { start_time: "asc" },
      include: {
        mentor_user: {
          select: { full_name: true, email: true, avatar_url: true },
        },
      },
    });

    return { success: true, data: meetings };
  } catch (error) {
    console.error("[Meeting] Error:", error);
    return { success: false, error: "Không thể tải danh sách", data: [] };
  }
}

/**
 * Lấy meetings của student trong khoảng thời gian (để hiển thị lên calendar)
 */
export async function getStudentMeetingsInRange(start: Date, end: Date) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Bạn chưa đăng nhập", data: [] };
    }
    const currentUser = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });
    const meetings = await prisma.consultation_meetings.findMany({
      where: {
        OR: [
          { student_id: session.user.id },
          ...(currentUser?.email ? [{ student_email: currentUser.email }] : []),
        ],
        start_time: { gte: start, lte: end },
      },
      orderBy: { start_time: "asc" },
      include: {
        mentor_user: {
          select: { full_name: true, email: true, avatar_url: true },
        },
      },
    });
    return { success: true, data: meetings };
  } catch (error) {
    console.error("[Meeting] getStudentMeetingsInRange Error:", error);
    return { success: false, error: "Không thể tải lịch", data: [] };
  }
}

/**
 * Xóa buổi tư vấn và gửi email thông báo hủy cho học viên
 */
export async function deleteMeeting(meetingId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    const meeting = await prisma.consultation_meetings.findUnique({
      where: { id: meetingId },
      include: {
        mentor_user: { select: { full_name: true } },
      },
    });

    if (!meeting) return { success: false, error: "Không tìm thấy cuộc họp" };
    if (meeting.mentor_id !== session.user.id) return { success: false, error: "Không có quyền xóa" };

    // Gửi email hủy cho học viên trước khi xóa
    const transporter = getEmailTransporter();
    if (transporter && meeting.student_email) {
      try {
        const cancelHtml = generateMeetingCancelEmail({
          title: meeting.title,
          startTime: meeting.start_time,
          mentorName: meeting.mentor_user?.full_name ?? undefined,
        });

        await transporter.sendMail({
          from: `"HOEX - Holy Explore" <${EMAIL_USER}>`,
          to: meeting.student_email,
          subject: `[HOEX] Thông báo hủy lịch tư vấn: ${meeting.title}`,
          html: cancelHtml,
        });

        console.log("[Email] Cancellation sent to:", meeting.student_email);
      } catch (emailError) {
        console.error("[Email] Failed to send cancellation email:", emailError);
        // Không dừng lại, vẫn xóa meeting
      }
    }

    // Xóa khỏi database
    await prisma.consultation_meetings.delete({ where: { id: meetingId } });

    console.log("[Meeting] Deleted:", meetingId);

    return { success: true };
  } catch (error) {
    console.error("[Meeting] Delete error:", error);
    return { success: false, error: "Không thể xóa cuộc họp" };
  }
}

/**
 * Cập nhật thông tin buổi tư vấn và gửi email thông báo thay đổi cho học viên
 */
export async function updateConsultationEvent(
  meetingId: string,
  data: {
    content?: string;
    startTime?: Date;
    durationMinutes?: number;
  }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    // Lấy meeting hiện tại
    const existing = await prisma.consultation_meetings.findUnique({
      where: { id: meetingId },
      include: {
        mentor_user: { select: { full_name: true } },
      },
    });

    if (!existing) return { success: false, error: "Không tìm thấy cuộc họp" };
    if (existing.mentor_id !== session.user.id) return { success: false, error: "Không có quyền chỉnh sửa" };

    // Tính toán lại các trường cần cập nhật
    const newStartTime = data.startTime ? new Date(data.startTime) : existing.start_time;
    const newDuration = data.durationMinutes ?? existing.duration_minutes;
    const newEndTime = addMinutes(newStartTime, newDuration);
    const newTitle = data.content ?? existing.title;

    // Cập nhật trong database
    const updated = await prisma.consultation_meetings.update({
      where: { id: meetingId },
      data: {
        title: newTitle,
        description: newTitle,
        start_time: newStartTime,
        end_time: newEndTime,
        duration_minutes: newDuration,
      },
    });

    console.log("[Meeting] Updated:", meetingId);

    // Gửi email thông báo cập nhật cho học viên
    const transporter = getEmailTransporter();
    if (transporter && existing.student_email) {
      try {
        const updateHtml = generateMeetingUpdateEmail({
          title: newTitle,
          description: newTitle,
          startTime: newStartTime,
          endTime: newEndTime,
          meetLink: existing.meet_link ?? "",
          mentorName: existing.mentor_user?.full_name ?? undefined,
        });

        await transporter.sendMail({
          from: `"HOEX - Holy Explore" <${EMAIL_USER}>`,
          to: existing.student_email,
          subject: `[HOEX] Lịch tư vấn đã được cập nhật: ${newTitle}`,
          html: updateHtml,
        });

        console.log("[Email] Update notification sent to:", existing.student_email);
      } catch (emailError) {
        console.error("[Email] Failed to send update email:", emailError);
        // Không dừng lại, vẫn trả về success
      }
    }

    return { success: true, data: updated };
  } catch (error) {
    console.error("[Meeting] Update error:", error);
    if (error instanceof Error) {
      return { success: false, error: `Lỗi: ${error.message}` };
    }
    return { success: false, error: "Không thể cập nhật cuộc họp" };
  }
}

/**
 * Lấy cuộc họp sắp tới gần nhất giữa current user và một user khác
 * Dùng cho giao diện Chat để hiển thị lịch hẹn sắp tới
 */
export async function getUpcomingMeetingWithUser(partnerId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, data: null, error: "Bạn chưa đăng nhập" };
    }

    const currentUserId = session.user.id;

    const meeting = await prisma.consultation_meetings.findFirst({
      where: {
        start_time: { gte: new Date() },
        OR: [
          // Current user là mentor, partner là student
          { mentor_id: currentUserId, student_id: partnerId },
          // Current user là student, partner là mentor
          { mentor_id: partnerId, student_id: currentUserId },
        ],
      },
      orderBy: { start_time: "asc" },
      select: {
        id: true,
        title: true,
        start_time: true,
        end_time: true,
        duration_minutes: true,
        meet_link: true,
        host_meet_link: true,
        mentor_id: true,
      },
    });

    return { success: true, data: meeting };
  } catch (error) {
    console.error("[Meeting] Error fetching upcoming meeting with user:", error);
    return { success: false, data: null, error: "Không thể tải lịch hẹn" };
  }
}

