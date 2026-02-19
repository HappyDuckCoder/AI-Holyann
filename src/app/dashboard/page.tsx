"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSession } from '@/hooks/useAuthSession';
import { getRoleDashboardPath } from '@/lib/utils/role-paths';
import { PageLoading } from '@/components/ui/PageLoading';

export default function DashboardRedirect() {
  const router = useRouter();
  const { user, isLoading } = useAuthSession();

  useEffect(() => {
    if (!isLoading && user) {
      const dashboardPath = getRoleDashboardPath(user.role);
      router.replace(dashboardPath);
    } else if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-background">
      <PageLoading message="Đang chuyển hướng..." />
    </div>
  );
}
