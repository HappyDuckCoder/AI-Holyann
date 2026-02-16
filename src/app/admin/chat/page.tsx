'use client';

import { ChatPage } from '@/components/chat/ChatPage';
import AuthHeader from '@/components/auth/AuthHeader';
import RoleGuard from '@/components/auth/RoleGuard';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useEffect } from 'react';

export default function ChatDashboard() {
    const { user, isLoading, isAuthenticated } = useAuthSession();
    const authReady = !isLoading;

    useEffect(() => {
        console.log('🔍 [Chat Page] Auth State:', {
            authReady,
            isAuthenticated,
            user,
            userId: user?.id,
            userRole: user?.role
        });
    }, [authReady, isAuthenticated, user]);

    if (!authReady) {
        console.log('⏳ [Chat Page] Waiting for auth...');
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }


    return (
        <RoleGuard allowedRoles={['user', 'student', 'mentor', 'admin']}>
            <div className="h-screen flex flex-col bg-white text-gray-900">
                <AuthHeader />
                <div className="flex-1 overflow-hidden bg-gray-50">
                    <ChatPage />
                </div>
            </div>
        </RoleGuard>
    );
}

