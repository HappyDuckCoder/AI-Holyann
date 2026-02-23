'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, Monitor, Moon, Sun } from 'lucide-react';
import { StudentPageContainer } from '@/components/student';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';

export default function StudentSettingsPage() {
  const { theme, resolvedTheme, setTheme, mounted } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

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

            {/* Chế độ hiển thị / Theme */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  {mounted && theme === 'system' ? (
                    <Monitor className="size-5" />
                  ) : mounted && isDarkMode ? (
                    <Moon className="size-5" />
                  ) : (
                    <Sun className="size-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">Chế độ hiển thị</p>
                  <p className="text-sm text-muted-foreground">
                    Sáng, tối, hoặc theo hệ thống
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      theme === t
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {t === 'light' && <Sun className="size-4" />}
                    {t === 'dark' && <Moon className="size-4" />}
                    {t === 'system' && <Monitor className="size-4" />}
                    {t === 'light' ? 'Sáng' : t === 'dark' ? 'Tối' : 'Hệ thống'}
                  </button>
                ))}
              </div>
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
