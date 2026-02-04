"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSession } from '@/hooks/useAuthSession';
import { getRoleDashboardPath } from '@/lib/utils/role-paths';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
