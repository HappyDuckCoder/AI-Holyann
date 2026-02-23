import React from "react";
import StudentNavbar from "@/components/student/StudentNavbar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground transition-colors duration-300">
      <StudentNavbar />
      <main className="w-full">{children}</main>
    </div>
  );
}
