'use server'

import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

// ==================== Helpers ====================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/

function identifierType(identifier: string): 'email' | 'phone' | null {
  const v = identifier.trim()
  if (EMAIL_REGEX.test(v)) return 'email'
  if (PHONE_REGEX.test(v)) return 'phone'
  return null
}

function getEmailTransporter() {
  const EMAIL_USER = process.env.EMAIL_USER
  const EMAIL_PASS = process.env.EMAIL_PASS

  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn('[Email] Missing EMAIL_USER or EMAIL_PASS in .env')
    return null
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  })
}

// ==================== Hàm 1: Gửi mã OTP ====================

export async function sendResetCode(identifier: string) {
  try {
    if (!identifier || !identifier.trim()) {
      return { success: false, message: 'Vui lòng nhập email hoặc số điện thoại' }
    }

    const normalized = identifier.trim().toLowerCase()
    const type = identifierType(normalized)

    if (!type) {
      return { success: false, message: 'Email hoặc số điện thoại không hợp lệ' }
    }

    // 1. Tìm user trong bảng users
    const user = await prisma.users.findFirst({
      where: type === 'email'
        ? { email: normalized }
        : { phone_number: normalized },
      select: { id: true, email: true, phone_number: true, full_name: true },
    })

    if (!user) {
      return { success: false, message: 'Không tìm thấy tài khoản với thông tin này' }
    }

    // 2. Tạo OTP 6 chữ số + thời gian hết hạn 10 phút
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 10 * 60 * 1000)

    // 3. Xóa token cũ của identifier, lưu token mới (raw SQL vì model chưa generate)
    await prisma.$executeRawUnsafe(
      `DELETE FROM password_reset_otps WHERE email = $1`,
      normalized
    )

    await prisma.$executeRawUnsafe(
      `INSERT INTO password_reset_otps (id, email, otp, expires_at, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, NOW())`,
      normalized,
      otp,
      expires
    )

    // 4. Gửi mã theo kênh phù hợp
    if (type === 'email') {
      const transporter = getEmailTransporter()

      if (!transporter) {
        return {
          success: false,
          message: 'Hệ thống email chưa được cấu hình. Vui lòng liên hệ quản trị viên.',
        }
      }

      await transporter.sendMail({
        from: `"Holyann Explore" <${process.env.EMAIL_USER}>`,
        to: normalized,
        subject: 'Mã Xác Nhận Đổi Mật Khẩu - Holyann Explore',
        html: `
          <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:28px 24px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Holyann Explore</h1>
              <p style="color:#bfdbfe;margin:6px 0 0;font-size:13px;">Con đường đến giáo dục toàn cầu</p>
            </div>

            <div style="padding:32px 24px;">
              <h2 style="color:#1e293b;margin:0 0 12px;font-size:18px;">Xin chào ${user.full_name || 'bạn'},</h2>
              <p style="color:#475569;line-height:1.6;margin:0 0 24px;">
                Chúng tôi nhận được yêu cầu đổi mật khẩu cho tài khoản của bạn.
                Sử dụng mã xác nhận bên dưới để tiếp tục:
              </p>

              <div style="text-align:center;margin:28px 0;">
                <div style="display:inline-block;background:#f1f5f9;border:2px dashed #2563eb;border-radius:12px;padding:18px 40px;">
                  <p style="margin:0 0 4px;font-size:12px;color:#64748b;letter-spacing:1px;text-transform:uppercase;">Mã xác nhận</p>
                  <p style="margin:0;font-size:36px;font-weight:800;color:#1e3a5f;letter-spacing:8px;">${otp}</p>
                </div>
              </div>

              <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 6px 6px 0;margin:20px 0 0;">
                <p style="color:#92400e;margin:0;font-size:13px;">
                  ⏰ <strong>Mã này có hiệu lực trong 10 phút.</strong><br>
                  Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.
                </p>
              </div>
            </div>

            <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="color:#94a3b8;font-size:12px;margin:0;">© 2026 Holyann Explore. All rights reserved.</p>
            </div>
          </div>
        `,
      })

      console.log(`✅ [OTP] Sent OTP email to ${normalized}`)
    } else {
      // Phone: mock SMS (tích hợp Twilio/ESMS sau)
      console.log(`[SMS MOCK] Gửi OTP: ${otp} đến số ${normalized}`)
    }

    return {
      success: true,
      message: type === 'email'
        ? 'Mã xác nhận đã được gửi đến email của bạn'
        : 'Mã xác nhận đã được gửi đến số điện thoại của bạn',
      type,
    }
  } catch (error) {
    console.error('❌ [OTP] sendResetCode error:', error)
    return { success: false, message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.' }
  }
}

// ==================== Hàm 2: Đặt lại mật khẩu bằng OTP ====================

export async function resetPasswordWithCode(
  identifier: string,
  code: string,
  newPassword: string,
) {
  try {
    if (!identifier || !identifier.trim()) {
      return { success: false, message: 'Thông tin định danh không hợp lệ' }
    }

    if (!code || code.trim().length !== 6) {
      return { success: false, message: 'Mã xác nhận phải gồm 6 chữ số' }
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' }
    }

    const normalized = identifier.trim().toLowerCase()
    const type = identifierType(normalized)

    if (!type) {
      return { success: false, message: 'Email hoặc số điện thoại không hợp lệ' }
    }

    // 1. Tìm token trong password_reset_otps (raw SQL)
    const records = await prisma.$queryRawUnsafe<Array<{ email: string; otp: string; expires_at: Date }>>(
      `SELECT * FROM password_reset_otps WHERE email = $1 AND otp = $2 LIMIT 1`,
      normalized,
      code.trim()
    )

    const record = records && records.length > 0 ? records[0] : null

    // 2. Kiểm tra tồn tại và chưa hết hạn
    if (!record) {
      return { success: false, message: 'Mã xác nhận không hợp lệ hoặc đã hết hạn' }
    }

    if (new Date(record.expires_at) < new Date()) {
      await prisma.$executeRawUnsafe(
        `DELETE FROM password_reset_otps WHERE email = $1`,
        normalized
      )
      return { success: false, message: 'Mã xác nhận không hợp lệ hoặc đã hết hạn' }
    }

    // 3. Tìm user tương ứng
    const user = await prisma.users.findFirst({
      where: type === 'email'
        ? { email: normalized }
        : { phone_number: normalized },
      select: { id: true },
    })

    if (!user) {
      return { success: false, message: 'Không tìm thấy tài khoản' }
    }

    // 4. Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 5. Cập nhật mật khẩu vào DB
    await prisma.users.update({
      where: { id: user.id },
      data: { password_hash: hashedPassword, auth_provider: 'LOCAL' },
    })

    // 6. Xóa token đã dùng
    await prisma.$executeRawUnsafe(
      `DELETE FROM password_reset_otps WHERE email = $1`,
      normalized
    )

    console.log(`✅ [OTP] Password reset successful for ${normalized}`)

    return { success: true, message: 'Đổi mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.' }
  } catch (error) {
    console.error('❌ [OTP] resetPasswordWithCode error:', error)
    return { success: false, message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.' }
  }
}

// ==================== Legacy: Đặt lại mật khẩu qua link email ====================

export async function requestPasswordReset(email: string) {
  try {
    if (!email) {
      return { success: false, message: 'Email không hợp lệ' }
    }

    const normalizedEmail = email.toLowerCase().trim()

    const user = await prisma.users.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, full_name: true },
    })

    if (!user) {
      return {
        success: true,
        message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu.',
      }
    }

    const token = crypto.randomUUID()
    const expires = new Date()
    expires.setHours(expires.getHours() + 1)

    await prisma.$executeRawUnsafe(
      `DELETE FROM password_reset_tokens WHERE email = $1`,
      normalizedEmail
    )
    await prisma.$executeRawUnsafe(
      `INSERT INTO password_reset_tokens (id, email, token, expires, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, NOW())`,
      normalizedEmail,
      token,
      expires
    )

    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
    const transporter = getEmailTransporter()

    if (!transporter) {
      return { success: false, message: 'Hệ thống email chưa được cấu hình. Vui lòng liên hệ quản trị viên.' }
    }

    await transporter.sendMail({
      from: `"Holyann Explore" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: 'Đặt Lại Mật Khẩu - Holyann Explore',
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:32px 24px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">Holyann Explore</h1>
            <p style="color:#bfdbfe;margin:8px 0 0;font-size:14px;">Con đường đến giáo dục toàn cầu</p>
          </div>
          <div style="padding:32px 24px;">
            <h2 style="color:#1e293b;margin:0 0 16px;font-size:20px;">Xin chào ${user.full_name || 'bạn'},</h2>
            <p style="color:#475569;line-height:1.6;margin:0 0 24px;">
              Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
              Nhấn vào nút bên dưới để tiếp tục:
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);color:#fff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:600;">
                Đặt Lại Mật Khẩu
              </a>
            </div>
            <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 6px 6px 0;margin:24px 0;">
              <p style="color:#92400e;margin:0;font-size:13px;">
                ⏰ <strong>Link này sẽ hết hiệu lực sau 1 giờ.</strong><br>
                Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
              </p>
            </div>
          </div>
          <div style="background:#f8fafc;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="color:#94a3b8;font-size:12px;margin:0;">© 2026 Holyann Explore. All rights reserved.</p>
          </div>
        </div>
      `,
    })

    return {
      success: true,
      message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu.',
    }
  } catch (error) {
    console.error('❌ [PasswordReset] requestPasswordReset error:', error)
    return { success: false, message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.' }
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    if (!token) return { success: false, message: 'Token không hợp lệ' }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' }
    }

    const records = await prisma.$queryRawUnsafe<Array<{ email: string; token: string; expires: Date }>>(
      `SELECT * FROM password_reset_tokens WHERE token = $1 LIMIT 1`,
      token
    )

    const resetToken = records && records.length > 0 ? records[0] : null

    if (!resetToken) {
      return { success: false, message: 'Token không hợp lệ hoặc đã hết hạn' }
    }

    if (new Date(resetToken.expires) < new Date()) {
      await prisma.$executeRawUnsafe(`DELETE FROM password_reset_tokens WHERE token = $1`, token)
      return { success: false, message: 'Token không hợp lệ hoặc đã hết hạn' }
    }

    const user = await prisma.users.findUnique({ where: { email: resetToken.email } })
    if (!user) return { success: false, message: 'Không tìm thấy tài khoản với email này' }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.users.update({ where: { id: user.id }, data: { password_hash: hashedPassword, auth_provider: 'LOCAL' } })
    await prisma.$executeRawUnsafe(`DELETE FROM password_reset_tokens WHERE email = $1`, resetToken.email)

    return { success: true, message: 'Đổi mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.' }
  } catch (error) {
    console.error('❌ [PasswordReset] resetPassword error:', error)
    return { success: false, message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.' }
  }
}
