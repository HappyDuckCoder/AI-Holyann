import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Function to send email (you'll need to configure your email service)
async function sendOTPEmail(email: string, otp: string) {
  const EMAIL_USER = process.env.EMAIL_USER;
  const EMAIL_PASS = process.env.EMAIL_PASS;

  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn(`⚠️ [DEV] OTP for ${email}: ${otp} (expires in 10 minutes)`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"Holyann Explore" <${EMAIL_USER}>`,
    to: email,
    subject: 'Mã Xác Nhận Đặt Lại Mật Khẩu - Holyann Explore',
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:28px 24px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Holyann Explore</h1>
          <p style="color:#bfdbfe;margin:6px 0 0;font-size:13px;">Con đường đến giáo dục toàn cầu</p>
        </div>
        <div style="padding:32px 24px;">
          <h2 style="color:#1e293b;margin:0 0 12px;font-size:18px;">Đặt lại mật khẩu</h2>
          <p style="color:#475569;line-height:1.6;margin:0 0 24px;">
            Sử dụng mã xác nhận bên dưới để đặt lại mật khẩu tài khoản của bạn:
          </p>
          <div style="text-align:center;margin:28px 0;">
            <div style="display:inline-block;background:#f1f5f9;border:2px dashed #2563eb;border-radius:12px;padding:18px 40px;">
              <p style="margin:0 0 4px;font-size:12px;color:#64748b;letter-spacing:1px;text-transform:uppercase;">Mã xác nhận</p>
              <p style="margin:0;font-size:36px;font-weight:800;color:#1e3a5f;letter-spacing:8px;">${otp}</p>
            </div>
          </div>
          <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 6px 6px 0;">
            <p style="color:#92400e;margin:0;font-size:13px;">
              ⏰ <strong>Mã này có hiệu lực trong 10 phút.</strong><br>
              Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
            </p>
          </div>
        </div>
        <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="color:#94a3b8;font-size:12px;margin:0;">© 2026 Holyann Explore. All rights reserved.</p>
        </div>
      </div>
    `,
  });
}

/** Đảm bảo bảng password_reset_otps tồn tại */
async function ensureOtpTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS password_reset_otps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL,
      otp VARCHAR(6) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT unique_email_otp UNIQUE (email, otp)
    )
  `);
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email là bắt buộc' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Kiểm tra user tồn tại
    const user = await prisma.users.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email không tồn tại trong hệ thống' },
        { status: 404 }
      );
    }

    // 2. Tạo OTP 6 chữ số
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 3. Đảm bảo bảng tồn tại, xóa OTP cũ, tạo mới
    await ensureOtpTable();

    await prisma.$executeRawUnsafe(
      `DELETE FROM password_reset_otps WHERE email = $1`,
      normalizedEmail
    );

    await prisma.$executeRawUnsafe(
      `INSERT INTO password_reset_otps (id, email, otp, expires_at, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, NOW())`,
      normalizedEmail,
      otp,
      expiresAt
    );

    // 4. Gửi OTP qua email
    let emailSent = false;
    try {
      await sendOTPEmail(normalizedEmail, otp);
      emailSent = true;
    } catch (emailError: unknown) {
      const emailErrMsg = emailError instanceof Error ? emailError.message : String(emailError);
      console.error('⚠️ [Email] Failed to send OTP email:', emailErrMsg);
      console.warn(`⚠️ [FALLBACK] OTP for ${normalizedEmail}: ${otp} (expires in 10 minutes)`);
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? 'Mã xác thực đã được gửi đến email của bạn'
        : 'Mã xác thực đã được tạo. Kiểm tra console log nếu email chưa được cấu hình.',
    });

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Forgot password error:', errMsg, error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra. Vui lòng thử lại sau.', detail: errMsg },
      { status: 500 }
    );
  }
}
