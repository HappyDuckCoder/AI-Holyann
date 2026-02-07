import React from 'react';
import MentorNavbar from '@/components/mentor/MentorNavbar';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300`}>
      {/* Navbar at the top */}
      <MentorNavbar />
      
      {/* Main Content Area - no container/padding, let child pages handle their own layout */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}
