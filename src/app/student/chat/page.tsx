'use client';

import { ChatPage } from '@/components/chat/ChatPage';
import RoleGuard from '@/components/auth/RoleGuard';
import { PageLoading } from '@/components/ui/PageLoading';
import { useAuthSession } from '@/hooks/useAuthSession';

export default function ChatDashboard() {
  const { isLoading } = useAuthSession();

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-theme(spacing.14))] bg-background">
        <PageLoading fullPage={false} message="Đang xác thực..." className="min-h-[calc(100vh-theme(spacing.14))]" />
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['user', 'student', 'mentor', 'admin']}>
      <div className="h-[calc(100vh-theme(spacing.14))] overflow-hidden bg-muted/30">
        <ChatPage />
      </div>
    </RoleGuard>
  );
}

