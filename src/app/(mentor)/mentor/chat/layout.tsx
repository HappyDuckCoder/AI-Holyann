import React from 'react';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fixed positioning to ensure chat takes full viewport height minus navbar
  // Navbar height is approximately 64-72px (py-4 on header)
  return (
    <div className="fixed inset-0 top-[72px]">
      {children}
    </div>
  );
}
