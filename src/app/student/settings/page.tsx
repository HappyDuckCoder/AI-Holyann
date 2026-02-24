'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, User } from 'lucide-react';
import { StudentPageContainer } from '@/components/student';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi, type AccountMe } from '@/services/auth-api.service';
import { ChangePasswordCard } from '@/components/student/settings/ChangePasswordCard';
import { DeleteAccountCard } from '@/components/student/settings/DeleteAccountCard';

export default function StudentSettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [account, setAccount] = useState<AccountMe | null>(null);
  const [accountLoading, setAccountLoading] = useState(true);

  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  useEffect(() => {
    if (status === 'unauthenticated' || !session) {
      setAccountLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const result = await authApi.getMe(accessToken);
      if (cancelled) return;
      if (result.ok) {
        setAccount(result.data);
      } else {
        if (result.status === 401) {
          router.replace('/login');
          return;
        }
        setAccount(null);
      }
      setAccountLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [status, session, accessToken, router]);

  if (status === 'loading' || accountLoading) {
    return (
      <StudentPageContainer fullWidth className="min-w-screen">
        <div className="w-full flex items-center justify-center py-24">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </StudentPageContainer>
    );
  }

  if (status === 'unauthenticated' || !session) {
    router.replace('/login');
    return null;
  }

  const providerLabel = account?.provider === 'google' ? 'Google' : 'Local (email/mật khẩu)';
  const createdAtLabel = account?.createdAt
    ? new Date(account.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';

  return (
    <StudentPageContainer fullWidth className="min-w-screen w-full">
      <div className="w-full min-w-0 max-w-4xl mx-auto space-y-10">
        {/* Page header */}
        <div className="pb-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Cài đặt</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Quản lý tài khoản, bảo mật và giao diện.
          </p>
        </div>

        {/* 1. Account Information */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Thông tin tài khoản
          </h2>
          <Card className="rounded-2xl border border-border bg-card shadow-md overflow-hidden">
            <CardHeader className="border-b border-border/80 bg-muted/20 px-6 py-5">
              <CardTitle className="text-lg flex items-center gap-2.5 font-semibold">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <User className="size-5" />
                </div>
                Thông tin tài khoản
              </CardTitle>
              <CardDescription className="mt-1">
                Email, nguồn đăng nhập và ngày tạo tài khoản
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 px-6 pb-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2.5 rounded-lg border border-input/80 bg-muted/30 px-3.5 py-2.5">
                    <Mail className="size-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">{account?.email ?? '—'}</span>
                  </div>
                  {account?.provider === 'google' && (
                    <p className="text-xs text-muted-foreground">Email từ tài khoản Google (chỉ đọc)</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Đăng nhập bằng</label>
                  <p className="text-sm font-medium text-foreground">{providerLabel}</p>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Ngày tạo tài khoản</label>
                  <p className="text-sm font-medium text-foreground">{createdAtLabel}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 2. Security */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Bảo mật
          </h2>
          <ChangePasswordCard accessToken={accessToken} account={account} />
        </section>

        {/* Tùy chọn – Giao diện & liên kết / Phân tích hồ sơ và chế độ hiển thị (đã tắt) */}
        {/* <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Tùy chọn
          </h2>
          <Card className="rounded-2xl border border-border bg-card shadow-md overflow-hidden">
            <CardHeader className="border-b border-border/80 bg-muted/20 px-6 py-5">
              <CardTitle className="text-lg font-semibold">Giao diện & liên kết</CardTitle>
              <CardDescription className="mt-1">
                Phân tích hồ sơ và chế độ hiển thị
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border/80">
              <div className="flex items-center justify-between gap-4 py-5 first:pt-0 px-6">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BarChart3 className="size-5" />
                  </div>
                  <div className="min-w-0">
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-5 px-6">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
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
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
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
        </section> */}

        {/* 3. Danger Zone */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Vùng nguy hiểm
          </h2>
          <DeleteAccountCard accessToken={accessToken} account={account} />
        </section>

        <p className="text-sm text-muted-foreground pt-2 pb-4">
          Bạn cũng có thể đổi chế độ sáng/tối và đăng xuất từ menu tài khoản trên thanh điều hướng.
        </p>
      </div>
    </StudentPageContainer>
  );
}
