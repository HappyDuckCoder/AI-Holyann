"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight, ArrowLeft } from "lucide-react";

type Step = "current" | "new" | "confirm";

const slide = {
  enter: (dir: number) => ({ x: dir * 24, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -24, opacity: 0 }),
};

const PASSWORD_MIN = 8;
const PASSWORD_HINT = "Ít nhất 8 ký tự, có chữ hoa, thường, số và ký tự đặc biệt";

export default function ChangePassword() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState<Step>("current");
  const [direction, setDirection] = useState(0);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const goTo = (next: Step, d: number) => {
    setDirection(d);
    setErrorMessage("");
    setStep(next);
  };

  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  const handleSubmitCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim()) return;
    goTo("new", 1);
  };

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    if (newPassword.length < PASSWORD_MIN) {
      setErrorMessage("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }
    goTo("confirm", 1);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu mới và xác nhận không khớp");
      return;
    }
    if (newPassword.length < PASSWORD_MIN) {
      setErrorMessage(PASSWORD_HINT);
      return;
    }
    if (!accessToken) {
      setErrorMessage("Bạn cần đăng nhập để đổi mật khẩu");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          oldPassword: currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setErrorMessage(data?.message || "Đổi mật khẩu thất bại");
      }
    } catch {
      setErrorMessage("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    return (
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold tracking-tight text-foreground">
            Đổi mật khẩu
          </h1>
          <p className="mt-2 text-muted-foreground">
            Bạn cần đăng nhập để đổi mật khẩu.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
        >
          Đến trang đăng nhập
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

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

      <AnimatePresence mode="wait" custom={direction}>
        {step === "current" && (
          <motion.form
            key="current"
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
            onSubmit={handleSubmitCurrent}
            className="space-y-8"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-semibold tracking-tight text-foreground">
                Đổi mật khẩu
              </h1>
              <p className="mt-2 text-muted-foreground">
                Nhập mật khẩu hiện tại của bạn
              </p>
            </div>
            <div className="space-y-4">
              {errorMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 dark:text-red-400"
                >
                  {errorMessage}
                </motion.p>
              )}
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  autoFocus
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="Mật khẩu hiện tại"
                  required
                  className="w-full px-0 py-3 pr-10 bg-transparent text-foreground text-lg placeholder:text-muted-foreground/60 border-0 border-b border-border dark:border-slate-600 focus:border-primary focus:outline-none focus:ring-0 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((p) => !p)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showCurrent ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="submit"
                disabled={!currentPassword.trim()}
                className="flex items-center justify-center gap-2 w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                Tiếp tục
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.form>
        )}

        {step === "new" && (
          <motion.form
            key="new"
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
            onSubmit={handleSubmitNew}
            className="space-y-8"
          >
            <button
              type="button"
              onClick={() => goTo("current", -1)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors -ml-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-semibold tracking-tight text-foreground">
                Mật khẩu mới
              </h1>
              <p className="mt-2 text-muted-foreground">{PASSWORD_HINT}</p>
            </div>
            <div className="space-y-4">
              {errorMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 dark:text-red-400"
                >
                  {errorMessage}
                </motion.p>
              )}
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  autoFocus
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="Mật khẩu mới"
                  required
                  minLength={PASSWORD_MIN}
                  className="w-full px-0 py-3 pr-10 bg-transparent text-foreground text-lg placeholder:text-muted-foreground/60 border-0 border-b border-border dark:border-slate-600 focus:border-primary focus:outline-none focus:ring-0 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((p) => !p)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showNew ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="submit"
                disabled={newPassword.length < PASSWORD_MIN}
                className="flex items-center justify-center gap-2 w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                Tiếp tục
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.form>
        )}

        {step === "confirm" && (
          <motion.form
            key="confirm"
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
            onSubmit={handleChangePassword}
            className="space-y-8"
          >
            <button
              type="button"
              onClick={() => goTo("new", -1)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors -ml-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-semibold tracking-tight text-foreground">
                Xác nhận mật khẩu mới
              </h1>
              <p className="mt-2 text-muted-foreground">
                Nhập lại mật khẩu mới để xác nhận
              </p>
            </div>
            <div className="space-y-4">
              {errorMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 dark:text-red-400"
                >
                  {errorMessage}
                </motion.p>
              )}
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  autoFocus
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  disabled={isLoading}
                  className="w-full px-0 py-3 pr-10 bg-transparent text-foreground text-lg placeholder:text-muted-foreground/60 border-0 border-b border-border dark:border-slate-600 focus:border-primary focus:outline-none focus:ring-0 transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="submit"
                disabled={isLoading || newPassword !== confirmPassword}
                className="flex items-center justify-center gap-2 w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-all duration-200"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Đổi mật khẩu"
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Footer — cùng style với Login/Register */}
      <div className="mt-12 pt-6 space-y-6">
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/dashboard" className="text-primary hover:underline font-medium">
            ← Về Dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
