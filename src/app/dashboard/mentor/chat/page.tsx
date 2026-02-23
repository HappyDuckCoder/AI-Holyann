'use client';

import { ChatPage } from '@/components/chat/ChatPage';
import AuthHeader from '@/components/auth/AuthHeader';
import RoleGuard from '@/components/auth/RoleGuard';
import { useAuthSession } from '@/hooks/useAuthSession';

export default function MentorChatDashboard() {
    const { user, isLoading, isAuthenticated } = useAuthSession();
    const authReady = !isLoading;

    if (!authReady) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user?.id) {
        return null; // RoleGuard will handle redirect
    }

    return (
        <RoleGuard allowedRoles={['MENTOR', 'ADMIN']}>
            <div className="h-screen flex flex-col bg-white text-gray-900">
                <AuthHeader />
                <div className="flex-1 min-h-0 overflow-hidden bg-gray-50">
                    <ChatPage />
                </div>
            </div>
        </RoleGuard>
    );
}
