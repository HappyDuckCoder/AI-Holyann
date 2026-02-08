"use client";
import React from 'react';
import DashboardComponent from '@/components/student/dashboard/Dashboard';
import { StudentPageContainer } from '@/components/student';
import RoleGuard from '@/components/auth/RoleGuard';
import {useAuthSession} from '@/hooks/useAuthSession';

export default function StudentDashboardPage() {
    const {user} = useAuthSession();

  return (
    <RoleGuard allowedRoles={['user', 'student', 'STUDENT']}>
      <StudentPageContainer>
        <div className="flex justify-center">
          <DashboardComponent userName={user?.name || 'Người dùng'} />
        </div>
      </StudentPageContainer>
    </RoleGuard>
  );
}
