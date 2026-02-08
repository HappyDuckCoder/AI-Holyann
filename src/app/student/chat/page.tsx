'use client';

import { ChatPage } from '@/components/chat/ChatPage';
import RoleGuard from '@/components/auth/RoleGuard';
import { useAuthSession } from '@/hooks/useAuthSession';

export default function ChatDashboard() {
  const { isLoading } = useAuthSession();

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-theme(spacing.14))] items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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

