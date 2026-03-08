import React from 'react';
import MentorNavbar from '@/components/mentor/MentorNavbar';

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Navbar at the top */}
      <MentorNavbar />
      
      {/* Main Content Area - no container/padding, let child pages handle their own layout */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}
