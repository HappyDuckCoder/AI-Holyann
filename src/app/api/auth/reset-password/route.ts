import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP và mật khẩu mới là bắt buộc' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      );
    }

    // Verify OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from('password_reset_otps')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('otp', otp)
      .single();

    if (otpError || !otpRecord) {
      return NextResponse.json(
        { error: 'Mã xác thực không đúng' },
        { status: 400 }
      );
    }

    // Check expiry
    const now = new Date();
    const expiresAt = new Date(otpRecord.expires_at);

    if (now > expiresAt) {
      await supabase
        .from('password_reset_otps')
        .delete()
        .eq('email', email.toLowerCase());

      return NextResponse.json(
        { error: 'Mã xác thực đã hết hạn' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const isDevelopment = process.env.NODE_ENV === 'development';

    // Update password (skip if user doesn't exist in dev mode)
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('email', email.toLowerCase());

    if (updateError) {
      if (isDevelopment) {
      } else {
        console.error('Error updating password:', updateError);
        return NextResponse.json(
          { error: 'Không thể cập nhật mật khẩu' },
          { status: 500 }
        );
      }
    }

    // Delete OTP
    await supabase
      .from('password_reset_otps')
      .delete()
      .eq('email', email.toLowerCase());

    return NextResponse.json({
      success: true,
      message: 'Mật khẩu đã được đặt lại thành công',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra' },
      { status: 500 }
    );
  }
}
