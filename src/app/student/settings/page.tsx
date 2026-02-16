'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, Moon, Sun } from 'lucide-react';
import { StudentPageContainer } from '@/components/student';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function getInitialDark(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

export default function StudentSettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDarkMode(getInitialDark());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    try {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    } catch {}
  }, [mounted, isDarkMode]);

  return (
    <StudentPageContainer>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Cài đặt</h1>
          <p className="mt-2 text-muted-foreground">
            Quản lý liên kết nhanh và giao diện.
          </p>
        </div>

        <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/30">
            <CardTitle className="text-lg">Tùy chọn</CardTitle>
            <CardDescription>
              Phân tích hồ sơ và chế độ hiển thị
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {/* Phân tích hồ sơ */}
            <div className="flex items-center justify-between py-4 first:pt-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BarChart3 className="size-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Phân tích hồ sơ</p>
                  <p className="text-sm text-muted-foreground">
                    Xem đánh giá tổng quan và phân tích AI (điểm mạnh, spike, khu vực)
                  </p>
                </div>
              </div>
              <Link
                href="/student/profile-analysis"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline shrink-0"
              >
                Mở trang
                <ArrowRight className="size-4" />
              </Link>
            </div>

            {/* Chế độ tối */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  {mounted && isDarkMode ? (
                    <Moon className="size-5" />
                  ) : (
                    <Sun className="size-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">Chế độ tối</p>
                  <p className="text-sm text-muted-foreground">
                    Bật giao diện nền tối, giảm chói
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={mounted ? isDarkMode : false}
                aria-label="Bật chế độ tối"
                onClick={() => setIsDarkMode((prev) => !prev)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  mounted && isDarkMode ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow ring-0 transition-transform ${
                    mounted && isDarkMode ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                  style={{ marginTop: 2 }}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">
          Bạn cũng có thể đổi chế độ sáng/tối và đăng xuất từ menu tài khoản trên thanh điều hướng.
        </p>
      </div>
    </StudentPageContainer>
  );
}
