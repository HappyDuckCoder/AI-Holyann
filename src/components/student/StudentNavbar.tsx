'use client';

import Link from 'next/link';
import { useAuthSession } from '@/hooks/useAuthSession';
import { signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, LayoutDashboard, User, CheckSquare, GraduationCap, MessageCircle, Settings, Sun, Moon, LogOut, Sparkles, ClipboardList } from 'lucide-react';

const STUDENT_BASE = '/student';

const navItems = [
  { name: 'Dashboard', href: `${STUDENT_BASE}/dashboard`, icon: LayoutDashboard },
  { name: 'Profile', href: `${STUDENT_BASE}/profile`, icon: User },
  { name: 'Checklist', href: `${STUDENT_BASE}/checklist`, icon: CheckSquare },
  { name: 'Tests', href: `${STUDENT_BASE}/tests`, icon: ClipboardList },
  { name: 'Improve', href: `${STUDENT_BASE}/improve`, icon: Sparkles },
  { name: 'Universities', href: `${STUDENT_BASE}/profile/schools`, icon: GraduationCap },
  { name: 'Discussion', href: `${STUDENT_BASE}/chat`, icon: MessageCircle },
];

function isActive(pathname: string, href: string) {
  if (href === `${STUDENT_BASE}/dashboard`) return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

export default function StudentNavbar() {
  const { user, isAuthenticated } = useAuthSession();
  const logout = () => signOut({ callbackUrl: '/login' });
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const getInitialDark = () => {
    try {
      const theme = localStorage.getItem('theme');
      if (theme === 'dark') return true;
      if (theme === 'light') return false;
      return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  };

  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialDark);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    try {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    } catch {}
  }, [isDarkMode]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground px-4 py-4 shadow-md sm:px-6 md:px-8">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href={`${STUDENT_BASE}/dashboard`} className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 border border-primary-foreground/20 transition-colors group-hover:border-accent md:h-10 md:w-10">
              <GraduationCap className="h-4 w-4 text-accent md:h-5 md:w-5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold tracking-wider text-primary-foreground group-hover:text-accent transition-colors">
                HOLYANN
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary-foreground/90 md:text-xs">
                Student
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold tracking-wide transition-all after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-accent after:transition-all ${
                  active
                    ? 'text-primary-foreground after:w-full'
                    : 'text-primary-foreground/80 hover:text-primary-foreground after:w-0 hover:after:w-full'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: user dropdown (Settings, Theme, Logout) */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-2 py-1.5 pr-2 hover:bg-primary-foreground/20 hover:border-accent transition-colors md:gap-2 md:px-3 md:py-2"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/20 text-sm font-bold text-primary-foreground border-2 border-primary-foreground/30 md:h-8 md:w-8">
                  {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                </span>
                <span className="hidden max-w-[100px] truncate text-sm font-bold text-primary-foreground xl:block">
                  {user?.name}
                </span>
                <ChevronDown className={`h-4 w-4 text-primary-foreground transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right rounded-lg border border-border bg-popover p-1 shadow-xl text-foreground">
                  <div className="px-2 py-2 border-b border-border">
                    <p className="text-xs text-muted-foreground">Xin chào</p>
                    <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
                  </div>
                  <Link
                    href={`${STUDENT_BASE}/settings`}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    <Settings className="h-4 w-4" />
                    Cài đặt
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      toggleTheme();
                      setUserMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    {mounted && isDarkMode ? (
                      <>
                        <Sun className="h-4 w-4" />
                        Chế độ sáng
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4" />
                        Chế độ tối
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden rounded-md px-3 py-2 text-sm font-bold text-primary-foreground/90 hover:text-accent transition-colors md:block"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-foreground shadow-lg hover:bg-accent/90 transition-all"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 hover:bg-primary-foreground/20"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-primary-foreground" /> : <Menu className="h-5 w-5 text-primary-foreground" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-primary-foreground/20 bg-primary/95 backdrop-blur-md">
          <nav className="container flex flex-col gap-1 px-4 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
            {isAuthenticated && (
              <div className="mt-2 border-t border-primary-foreground/20 pt-2">
                <Link
                  href={`${STUDENT_BASE}/settings`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Settings className="h-4 w-4" />
                  Cài đặt
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    toggleTheme();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm text-primary-foreground hover:bg-primary-foreground/10 text-left"
                >
                  {mounted && isDarkMode ? <><Sun className="h-4 w-4" /> Chế độ sáng</> : <><Moon className="h-4 w-4" /> Chế độ tối</>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm text-destructive hover:bg-destructive/20 text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
