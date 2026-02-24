'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi, type AccountMe } from '@/services/auth-api.service';
import { cn } from '@/lib/utils';

interface DeleteAccountCardProps {
  accessToken: string | undefined;
  account: AccountMe | null;
}

export function DeleteAccountCard({ accessToken, account }: DeleteAccountCardProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmIrreversible, setConfirmIrreversible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const needsPassword = account?.hasPassword ?? true;
  const canConfirm = confirmIrreversible && (needsPassword ? password.trim().length > 0 : true);

  const handleDelete = async () => {
    if (!canConfirm || !accessToken) return;
    setError('');
    setLoading(true);
    try {
      const result = await authApi.deleteAccount(accessToken, {
        password: needsPassword ? password : undefined,
        confirmIrreversible: true,
      });
      if (result.ok) {
        toast.success('Tài khoản đã được xóa.');
        setOpen(false);
        await signOut({ redirect: false });
        router.push('/');
        router.refresh();
      } else {
        if (result.status === 401) {
          setError('Mật khẩu không đúng hoặc phiên đăng nhập hết hạn.');
          return;
        }
        setError(result.message || 'Không thể xóa tài khoản.');
      }
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setPassword('');
      setConfirmIrreversible(false);
      setError('');
    }
    setOpen(next);
  };

  return (
    <>
      <Card className="rounded-2xl border border-destructive/50 bg-destructive/5 shadow-md overflow-hidden">
        <CardHeader className="border-b border-destructive/30 bg-destructive/10 px-6 py-5">
          <CardTitle className="text-lg flex items-center gap-2.5 font-semibold text-destructive">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/20 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
            Danger Zone
          </CardTitle>
          <CardDescription className="mt-1">
            Xóa tài khoản và toàn bộ dữ liệu. Hành động này không thể hoàn tác.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 px-6 pb-6">
          <Button
            variant="destructive"
            onClick={() => setOpen(true)}
            className="w-full sm:w-auto"
          >
            Xóa tài khoản
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md p-6 gap-5">
          <DialogHeader className="pr-10 space-y-2 text-left">
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5 shrink-0" />
              Xóa tài khoản
            </DialogTitle>
            <DialogDescription className="text-left">
              This action is permanent and cannot be undone. All your data will be deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            {needsPassword && (
              <div className="space-y-2">
                <Label htmlFor="delete-password">Nhập mật khẩu để xác nhận</Label>
                <Input
                  id="delete-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  className={cn(error && 'border-destructive')}
                  autoComplete="current-password"
                />
              </div>
            )}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmIrreversible}
                onChange={(e) => setConfirmIrreversible(e.target.checked)}
                className="mt-1 rounded border-input"
              />
              <span className="text-sm text-muted-foreground">
                I understand this action is irreversible and I want to delete my account and all
                associated data.
              </span>
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!canConfirm || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Xóa tài khoản'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
