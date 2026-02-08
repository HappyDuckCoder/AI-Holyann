import React from 'react';
import StudentNavbar from '@/components/student/StudentNavbar';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <StudentNavbar />
      <main className="min-h-[calc(100vh-theme(spacing.14))]">
        {children}
      </main>
    </div>
  );
}
