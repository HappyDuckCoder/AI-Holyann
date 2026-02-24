'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi, type AccountMe } from '@/services/auth-api.service';
import { getPasswordStrength, isPasswordValid } from '@/lib/utils/password-strength';
import { cn } from '@/lib/utils';

const PASSWORD_HINT = 'Ít nhất 8 ký tự, có chữ hoa, thường, số và ký tự đặc biệt';

interface ChangePasswordCardProps {
  accessToken: string | undefined;
  account: AccountMe | null;
}

export function ChangePasswordCard({ accessToken, account }: ChangePasswordCardProps) {
  const router = useRouter();
  const isSetPasswordMode = account?.provider === 'google' && !account?.hasPassword;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string; submit?: string }>({});

  const strength = getPasswordStrength(newPassword);
  const confirmMatch = !confirmPassword || newPassword === confirmPassword;

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!isSetPasswordMode && !currentPassword.trim()) {
      next.current = 'Nhập mật khẩu hiện tại';
    }
    if (!newPassword.trim()) {
      next.new = 'Nhập mật khẩu mới';
    } else if (!isPasswordValid(newPassword)) {
      next.new = PASSWORD_HINT;
    }
    if (!confirmPassword.trim()) {
      next.confirm = 'Xác nhận mật khẩu';
    } else if (newPassword !== confirmPassword) {
      next.confirm = 'Mật khẩu xác nhận không khớp';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;
    if (!accessToken) {
      setErrors({ submit: 'Bạn cần đăng nhập' });
      return;
    }
    setLoading(true);
    try {
      if (isSetPasswordMode) {
        const result = await authApi.setPassword(accessToken, { newPassword });
        if (result.ok) {
          toast.success('Đã đặt mật khẩu thành công.');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          if (result.status === 401) {
            router.replace('/login');
            return;
          }
          setErrors({ submit: result.message });
        }
      } else {
        const result = await authApi.changePassword(accessToken, {
          oldPassword: currentPassword,
          newPassword,
        });
        if (result.ok) {
          toast.success('Đã đổi mật khẩu thành công.');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          if (result.status === 401) {
            setErrors({ current: 'Mật khẩu hiện tại không đúng.' });
            return;
          }
          setErrors({ submit: result.message });
        }
      }
    } catch {
      setErrors({ submit: 'Lỗi kết nối. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-md overflow-hidden">
      <CardHeader className="border-b border-border/80 bg-muted/20 px-6 py-5">
        <CardTitle className="text-lg flex items-center gap-2.5 font-semibold">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Lock className="size-5" />
          </div>
          {isSetPasswordMode ? 'Đặt mật khẩu' : 'Đổi mật khẩu'}
        </CardTitle>
        <CardDescription className="mt-1">
          {isSetPasswordMode
            ? 'Bạn đăng nhập bằng Google. Đặt mật khẩu để có thể đăng nhập bằng email/mật khẩu.'
            : 'Thay đổi mật khẩu đăng nhập của bạn.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 px-6 pb-6">
        {isSetPasswordMode && (
          <p className="mb-4 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3.5">
            You are logged in via Google. Set a password to enable password login.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-[min(100%,28rem)]">
          {!isSetPasswordMode && (
            <div className="space-y-2">
              <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setErrors((p) => ({ ...p, current: undefined }));
                  }}
                  placeholder="••••••••"
                  className={cn(errors.current && 'border-destructive')}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrent((p) => !p)}
                  aria-label={showCurrent ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.current && <p className="text-sm text-destructive">{errors.current}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="new-password">{isSetPasswordMode ? 'Mật khẩu mới' : 'Mật khẩu mới'}</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors((p) => ({ ...p, new: undefined }));
                }}
                placeholder="••••••••"
                className={cn(errors.new && 'border-destructive')}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowNew((p) => !p)}
                aria-label={showNew ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {/* Strength indicator */}
            {newPassword && (
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => {
                  const filled = i <= strength;
                  const colorClass = filled
                    ? strength <= 2
                      ? 'bg-destructive'
                      : strength === 3
                        ? 'bg-amber-500'
                        : 'bg-green-500'
                    : 'bg-muted';
                  return (
                    <div key={i} className={cn('h-1 flex-1 rounded-full transition-colors', colorClass)} />
                  );
                })}
              </div>
            )}
            {errors.new && <p className="text-sm text-destructive">{errors.new}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors((p) => ({ ...p, confirm: undefined }));
                }}
                placeholder="••••••••"
                className={cn(errors.confirm && 'border-destructive')}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirm((p) => !p)}
                aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {!confirmMatch && confirmPassword && (
              <p className="text-sm text-destructive">Mật khẩu xác nhận không khớp</p>
            )}
            {errors.confirm && <p className="text-sm text-destructive">{errors.confirm}</p>}
          </div>

          {errors.submit && <p className="text-sm text-destructive">{errors.submit}</p>}

          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang xử lý...
              </>
            ) : isSetPasswordMode ? (
              'Đặt mật khẩu'
            ) : (
              'Đổi mật khẩu'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
