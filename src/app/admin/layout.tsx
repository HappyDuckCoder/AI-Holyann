import React from 'react';
import AuthHeader from '@/components/auth/AuthHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <AuthHeader />
      <main className="min-h-[calc(100vh-theme(spacing.14))]">
        <div className="container max-w-screen-2xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
