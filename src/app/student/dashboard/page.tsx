"use client";
import React from 'react';
import AuthHeader from '@/components/auth/AuthHeader';
import DashboardComponent from '@/components/student/dashboard/Dashboard';
import RoleGuard from '@/components/auth/RoleGuard';
import {useAuthSession} from '@/hooks/useAuthSession';

export default function StudentDashboardPage() {
    const {user} = useAuthSession();

  return (
    <RoleGuard allowedRoles={["user", "student", "STUDENT"]}>
      <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
        {/* 1. Auth Header */}
        <AuthHeader />

        {/* 2. Main Content Area */}
        <div className="py-8 px-4">
          <div className="flex justify-center">
            <DashboardComponent userName={user?.name || "Người dùng"} />
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
