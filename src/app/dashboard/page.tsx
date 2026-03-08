import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-config";
import { redirect } from "next/navigation";

/**
 * Trang /dashboard: chuyển hướng theo role sau khi đăng nhập.
 * - Student / user → /student/dashboard
 * - Mentor → /mentor/dashboard
 * - Admin → /admin/dashboard
 * - Chưa đăng nhập → /login
 */
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  const role = (session.user as { role?: string }).role?.toUpperCase();
  if (role === "ADMIN") {
    redirect("/admin/dashboard");
  }
  if (role === "MENTOR") {
    redirect("/mentor/dashboard");
  }
  // STUDENT, user, hoặc mặc định
  redirect("/student/dashboard");
}
