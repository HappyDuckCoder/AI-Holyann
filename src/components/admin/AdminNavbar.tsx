'use client';

import Link from 'next/link';
import { useAuthSession } from '@/hooks/useAuthSession';
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, Users, GraduationCap, UserCog, MessageCircle, FileCheck } from 'lucide-react';

const navItems = [
  { name: 'Tổng quan', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Người dùng', href: '/admin/users', icon: Users },
  { name: 'Học viên', href: '/admin/students', icon: GraduationCap },
  { name: 'Mentor', href: '/admin/mentors', icon: UserCog },
  { name: 'Duyệt file', href: '/admin/file-review', icon: FileCheck },
  { name: 'Chat', href: '/admin/chat', icon: MessageCircle },
];

export default function AdminNavbar() {
  const { user, isAuthenticated } = useAuthSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const dark = document.documentElement.classList.contains('dark');
    setIsDarkMode(dark);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    try {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    } catch {
      // noop
    }
  }, [isDarkMode, mounted]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const logout = () => signOut({ callbackUrl: '/login' });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-6 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold text-foreground">
            <span className="text-lg tracking-tight">HOLYANN</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Admin</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {mounted && (
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              title={isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}
              aria-label={isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}
            >
              {isDarkMode ? (
                <span className="text-lg">☀️</span>
              ) : (
                <span className="text-lg">🌙</span>
              )}
            </button>
          )}
          {isAuthenticated && user && (
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <span className="hidden sm:block text-sm text-muted-foreground truncate max-w-[120px]">
                {user.name ?? user.email}
              </span>
              <button
                type="button"
                onClick={logout}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Đăng xuất
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-md p-2 text-muted-foreground hover:bg-muted"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="mt-2 text-left px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg"
              >
                Đăng xuất
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
