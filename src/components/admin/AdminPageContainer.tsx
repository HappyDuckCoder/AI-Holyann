'use client';

import React from 'react';

interface AdminPageContainerProps {
  children: React.ReactNode;
  /** No horizontal padding when true */
  noPadding?: boolean;
  /** Custom class for the inner container */
  className?: string;
}

/**
 * Reusable container for admin pages: consistent with student profile layout.
 * Same max-width and padding as StudentPageContainer for unified look.
 */
export function AdminPageContainer({
  children,
  noPadding,
  className = '',
}: AdminPageContainerProps) {
  return (
    <div className={`min-h-[calc(100vh-theme(spacing.14))] ${className}`}>
      <div
        className={
          noPadding
            ? 'w-full'
            : 'container max-w-screen-2xl px-4 py-6 sm:px-6 md:px-8 md:py-8'
        }
      >
        {children}
      </div>
    </div>
  );
}
