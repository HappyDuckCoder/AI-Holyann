import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// Function to send email (you'll need to configure your email service)
async function sendOTPEmail(email: string, otp: string) {
  // TODO: Integrate with your email service (SendGrid, AWS SES, Resend, etc.)
  // In development, OTP is logged to console for testing
  if (process.env.NODE_ENV === 'development') {
    console.warn(`⚠️ [DEV] OTP for ${email}: ${otp} (expires in 10 minutes)`);
  }

  // Example with Resend (uncomment and configure):
  /*
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to: email,
    subject: 'Mã Xác Thực Đặt Lại Mật Khẩu - Holyann Explore',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Đặt Lại Mật Khẩu</h2>
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Holyann Explore.</p>
        <p>Mã xác thực của bạn là:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #ef4444;">Mã này sẽ hết hiệu lực sau 10 phút.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">© 2026 Holyann Explore. All rights reserved.</p>
      </div>
    `,
  });
  */
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

    const isDevelopment = process.env.NODE_ENV === 'development';

    // Check if user exists (skip in development mode for testing)
    if (!isDevelopment) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email.toLowerCase())
        .single();

      if (userError || !user) {
        return NextResponse.json(
          { error: 'Email không tồn tại trong hệ thống' },
          { status: 404 }
        );
      }
    } else {
      console.warn('⚠️  DEVELOPMENT MODE: Bỏ qua kiểm tra email trong database');
      // Testing with email in development mode
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Set expiry time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Delete old OTPs for this email
    await supabase
      .from('password_reset_otps')
      .delete()
      .eq('email', email.toLowerCase());

    // Store OTP in database
    const { error: otpError } = await supabase
      .from('password_reset_otps')
      .insert({
        email: email.toLowerCase(),
        otp,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      });

    if (otpError) {
      console.error('Error storing OTP:', otpError);
      return NextResponse.json(
        { error: 'Không thể tạo mã xác thực. Vui lòng thử lại.' },
        { status: 500 }
      );
    }

    // Send OTP via email
    await sendOTPEmail(email, otp);

    return NextResponse.json({
      success: true,
      message: 'Mã xác thực đã được gửi đến email của bạn',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
