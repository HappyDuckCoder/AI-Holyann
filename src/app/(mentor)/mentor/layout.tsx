'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function MentorSubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isChatPage = pathname?.includes('/chat');

  // Chat page gets full width, other pages get container
  if (isChatPage) {
    return <>{children}</>;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {children}
    </div>
  );
}
