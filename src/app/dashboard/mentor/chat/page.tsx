'use client';

import ChatContainer from '@/components/chat/_legacy/ChatContainer';
import AuthHeader from '@/components/auth/AuthHeader';
import RoleGuard from '@/components/auth/RoleGuard';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function MentorChatDashboard() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!session?.user?.id) {
        redirect('/login');
    }

    return (
        <RoleGuard allowedRoles={['mentor', 'admin']}>
            <div className="h-screen flex flex-col bg-white text-gray-900">
                <AuthHeader />
                <div className="flex-1 overflow-hidden bg-gray-50">
                    <ChatContainer userId={session.user.id as string} />
                </div>
            </div>
        </RoleGuard>
    );
}
