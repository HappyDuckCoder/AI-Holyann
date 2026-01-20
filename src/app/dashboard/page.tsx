"use client";
import React, {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import AuthHeader from '@/components/dashboard/AuthHeader';
import DashboardComponent from '@/components/dashboard/Dashboard';
import RoleGuard from '@/components/auth/RoleGuard';
import {useAuth} from '@/contexts/AuthContext';

export default function DashboardPage() {
    const {user} = useAuth();
    const router = useRouter();

    // Auto-redirect mentor and admin to their respective dashboards
    useEffect(() => {
        if (user?.role) {
            const role = user.role.toLowerCase();
            if (role === 'mentor') {
                router.replace('/dashboard/mentor');
            } else if (role === 'admin') {
                router.replace('/dashboard/admin');
            }
        }
    }, [user, router]);

    return (
        <RoleGuard allowedRoles={['user', 'student', 'mentor', 'admin']}>
            <div
                className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
                {/* 1. Auth Header */}
                <AuthHeader/>

                {/* 2. Main Content Area */}
                <div className="py-8 px-4">
                    <div className="flex justify-center">
                        <DashboardComponent userName={user?.name || "Người dùng"}/>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}

