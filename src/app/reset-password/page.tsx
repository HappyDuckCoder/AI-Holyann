"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Verify OTP
      const verifyResponse = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        setError(verifyData.error || "Mã xác thực không đúng");
        setLoading(false);
        return;
      }

      // Step 2: Reset password
      const resetResponse = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const resetData = await resetResponse.json();

      if (resetResponse.ok) {
        setMessage("Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(resetData.error || "Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/auth/bg.jpg"
          alt="Background"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/90 via-blue-50/80 to-gray-50/90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full flex items-center justify-center">
        <div className="w-full max-w-5xl bg-white dark:bg-card rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100 dark:border-white/10 transition-all duration-300">
          {/* LEFT SIDE - IMAGE */}
          <div className="w-full md:w-1/2 relative h-64 md:h-auto min-h-[400px] md:min-h-[600px] overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center z-0">
                <div className="text-gray-400 text-sm">Đang tải hình ảnh...</div>
              </div>
            )}
            {imageLoaded && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/20 mix-blend-multiply z-10"></div>
                <div className="absolute bottom-8 left-8 right-8 text-white z-20">
                  <h2 className="text-3xl font-heading font-bold mb-2 text-white">
                    Đặt Lại Mật Khẩu
                  </h2>
                  <p className="text-lg opacity-90 font-sans">
                    Tạo mật khẩu mới cho tài khoản của bạn
                  </p>
                </div>
              </>
            )}
            <Image
              src="/images/auth/left.jpg"
              alt="Students studying"
              fill
              className={`object-cover transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="eager"
              priority
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(false)}
            />
          </div>

          {/* RIGHT SIDE - FORM */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-card transition-colors overflow-y-auto">
            <div className="max-w-md mx-auto w-full">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-heading font-bold text-primary dark:text-sky-400 mb-2">
                  Đặt Lại Mật Khẩu
                </h1>
                <p className="text-muted-foreground">
                  Nhập mã xác thực và mật khẩu mới
                </p>
              </div>

              {/* Success Message */}
              {message && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl mb-4">
                  {message}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-foreground mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-muted/30 dark:bg-muted/50 border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                    placeholder="name@example.com"
                    required
                    disabled={loading || !!emailFromQuery}
                  />
                </div>

                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-semibold text-foreground mb-2"
                  >
                    Mã Xác Thực (OTP)
                  </label>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full px-4 py-3 bg-muted/30 dark:bg-muted/50 border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white text-center text-2xl tracking-widest font-mono"
                    placeholder="000000"
                    maxLength={6}
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Mã gồm 6 chữ số đã được gửi đến email của bạn
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-semibold text-foreground mb-2"
                  >
                    Mật Khẩu Mới
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-muted/30 dark:bg-muted/50 border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-foreground mb-2"
                  >
                    Xác Nhận Mật Khẩu
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-muted/30 dark:bg-muted/50 border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-heading font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang xử lý..." : "Đặt Lại Mật Khẩu"}
                </button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <Link
                  href="/forgot-password"
                  className="block text-sm text-accent hover:underline font-medium"
                >
                  Gửi lại mã xác thực
                </Link>
                <Link
                  href="/login"
                  className="block text-sm text-muted-foreground hover:text-accent hover:underline"
                >
                  ← Quay lại đăng nhập
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
