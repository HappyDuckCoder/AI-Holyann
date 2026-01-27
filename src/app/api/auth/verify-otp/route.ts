import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email và mã OTP là bắt buộc' },
        { status: 400 }
      );
    }

    // Get OTP from database
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

    // Check if OTP is expired
    const now = new Date();
    const expiresAt = new Date(otpRecord.expires_at);

    if (now > expiresAt) {
      // Delete expired OTP
      await supabase
        .from('password_reset_otps')
        .delete()
        .eq('email', email.toLowerCase());

      return NextResponse.json(
        { error: 'Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mã xác thực hợp lệ',
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
