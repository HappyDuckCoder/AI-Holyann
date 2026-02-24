"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Mã xác thực đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.");
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        setError(data.error || "Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch {
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Link
        href="/"
        className="inline-block mb-12 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background rounded-lg"
      >
        <Image
          src="/images/logos/Logo_Holyann_ngang-removebg-preview.png"
          alt="Holyann"
          width={120}
          height={32}
          className="h-8 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity dark:invert dark:brightness-110"
          priority
        />
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-semibold tracking-tight text-foreground">
          Quên mật khẩu
        </h1>
        <p className="mt-2 text-muted-foreground">
          Nhập email bạn dùng để đăng ký, chúng tôi sẽ gửi mã xác thực
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm px-4 py-3 rounded-xl"
          >
            {message}
          </motion.div>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </motion.p>
        )}

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="vd: email@example.com"
            required
            disabled={loading}
            className="w-full px-0 py-3 bg-transparent text-foreground text-lg placeholder:text-muted-foreground/60 border-0 border-b border-border dark:border-slate-600 focus:border-primary focus:outline-none focus:ring-0 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-all duration-200"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Gửi mã xác thực
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Footer — cùng style với Login/Register */}
      <div className="mt-12 pt-6 space-y-6">
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline font-medium">
            ← Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
