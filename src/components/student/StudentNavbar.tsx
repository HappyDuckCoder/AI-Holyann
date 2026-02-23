"use client";

import Link from "next/link";
import { useAuthSession } from "@/hooks/useAuthSession";
import { signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  User,
  CheckSquare,
  GraduationCap,
  MessageCircle,
  Settings,
  LogOut,
  Sparkles,
  ClipboardList,
  FileBarChart,
  BarChart3,
  CalendarClock,
  LayoutGrid,
  Target,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const STUDENT_BASE = "/student";

const navItems = [
  { name: "Tổng quan", href: `${STUDENT_BASE}/dashboard`, icon: LayoutDashboard },
  { name: "Hồ sơ", href: `${STUDENT_BASE}/profile`, icon: User },
  { name: "Hạn nộp", href: `${STUDENT_BASE}/deadlines`, icon: CalendarClock },
  { name: "Danh sách công việc", href: `${STUDENT_BASE}/checklist`, icon: CheckSquare },
  { name: "Trao đổi", href: `${STUDENT_BASE}/chat`, icon: MessageCircle },
];

const functionalityItems = [
  {
    name: "Bài kiểm tra",
    href: `${STUDENT_BASE}/tests`,
    icon: ClipboardList,
    description: "Bài kiểm tra năng lực và định hướng nghề nghiệp",
  },
  {
    name: "Báo cáo",
    href: `${STUDENT_BASE}/reports`,
    icon: FileBarChart,
    description: "Báo cáo tiến độ và kết quả học tập",
  },
  {
    name: "Phân tích hồ sơ",
    href: `${STUDENT_BASE}/profile-analysis`,
    icon: BarChart3,
    description: "Phân tích điểm mạnh – điểm yếu hồ sơ",
  },
  {
    name: "Mục tiêu",
    href: `${STUDENT_BASE}/target`,
    icon: Target,
    description: "Trường và ngành mục tiêu phù hợp với bạn",
  },
  {
    name: "Cải thiện",
    href: `${STUDENT_BASE}/improve`,
    icon: Sparkles,
    description: "Gợi ý cải thiện CV, luận văn với AI",
  },
];

function isActive(pathname: string, href: string) {
  if (href === `${STUDENT_BASE}/dashboard`) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export default function StudentNavbar() {
  const { user, isAuthenticated } = useAuthSession();
  const logout = () => signOut({ callbackUrl: "/login" });
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [functionalitiesOpen, setFunctionalitiesOpen] = useState(false);
  const [mobileFunctionalitiesOpen, setMobileFunctionalitiesOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const functionalitiesCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFunctionalities = () => {
    if (functionalitiesCloseTimerRef.current) {
      clearTimeout(functionalitiesCloseTimerRef.current);
      functionalitiesCloseTimerRef.current = null;
    }
    setFunctionalitiesOpen(true);
  };
  const hideFunctionalities = () => {
    functionalitiesCloseTimerRef.current = setTimeout(() => setFunctionalitiesOpen(false), 250);
  };
  const clearFunctionalitiesTimer = () => {
    if (functionalitiesCloseTimerRef.current) {
      clearTimeout(functionalitiesCloseTimerRef.current);
      functionalitiesCloseTimerRef.current = null;
    }
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="navbar-header sticky top-0 z-50 w-full px-4 sm:px-6 md:px-8">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link
            href={`${STUDENT_BASE}/dashboard`}
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-lg transition-all duration-200 ease-in-out active:scale-[0.98]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 border border-primary-foreground/20 transition-colors group-hover:bg-primary-foreground/15 dark:bg-white/10 dark:border-white/10 dark:group-hover:bg-white/15 md:h-10 md:w-10">
              <GraduationCap className="h-4 w-4 text-accent md:h-5 md:w-5" />
            </div>
            <div className="flex flex-col leading-none gap-0.5">
              <span className="font-semibold tracking-[0.08em] text-primary-foreground dark:text-white">
                HOLYANN
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary-foreground/60 md:text-xs dark:text-white/60">
                Học viên
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium tracking-wide transition-all duration-200 ease-in-out cursor-pointer
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
                  hover:scale-[1.02] active:scale-[0.98]
                  ${active
                    ? "bg-primary-foreground/20 text-primary-foreground dark:bg-gradient-to-r dark:from-indigo-600/20 dark:to-blue-500/20 dark:text-white dark:shadow-[0_1px_0_0_rgba(255,255,255,0.08)]"
                    : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground dark:text-white/80 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "opacity-100" : "opacity-70"}`} />
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
                className="flex items-center gap-2 rounded-full border border-primary-foreground/20 px-2 py-1.5 pr-2 hover:bg-primary-foreground/10 dark:border-white/10 dark:hover:bg-slate-800 transition-all duration-200 ease-in-out md:gap-2 md:px-3 md:py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 active:scale-[0.98]"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/20 text-sm font-bold text-primary-foreground border border-primary-foreground/30 dark:bg-white/10 dark:text-white dark:border-white/10 md:h-8 md:w-8">
                  {user?.name?.charAt(0).toUpperCase() ?? "U"}
                </span>
                <span className="hidden max-w-[100px] truncate text-sm font-medium text-primary-foreground xl:block dark:text-white">
                  {user?.name}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-primary-foreground/80 transition-transform duration-200 dark:text-white/80 ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full z-50 mt-2 flex items-start gap-0 origin-top-right animate-in fade-in-0 zoom-in-95 duration-200"
                  onMouseLeave={hideFunctionalities}
                >
                  {/* Functionalities submenu */}
                  {functionalitiesOpen && (
                    <div
                      className="w-72 shrink-0 rounded-xl border border-border bg-popover dark:border-white/10 dark:bg-slate-900/95 dark:backdrop-blur-md p-2 shadow-lg text-foreground"
                      onMouseEnter={clearFunctionalitiesTimer}
                    >
                      <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-white/60">
                        Tính năng
                      </p>
                      {functionalityItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => {
                              setUserMenuOpen(false);
                              setFunctionalitiesOpen(false);
                            }}
                            className="flex gap-3 rounded-lg px-2 py-2.5 text-sm text-foreground hover:bg-muted dark:text-white/90 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Icon className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground dark:text-white/60" />
                            <div className="min-w-0">
                              <span className="font-medium block">{item.name}</span>
                              <span className="text-xs text-muted-foreground block mt-0.5 dark:text-white/60">
                                {item.description}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                  <div className="w-56 shrink-0 rounded-xl border border-border bg-popover dark:border-white/10 dark:bg-slate-900/95 dark:backdrop-blur-md p-1 shadow-lg text-foreground animate-in fade-in-0 zoom-in-95 duration-200">
                    <div className="px-2 py-2 border-b border-border dark:border-white/10">
                      <p className="text-xs text-muted-foreground dark:text-white/60">Xin chào</p>
                      <p className="truncate text-sm font-medium text-foreground dark:text-white">
                        {user?.name}
                      </p>
                    </div>
                    <div
                      className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm text-foreground hover:bg-muted dark:text-white/90 dark:hover:bg-slate-800 cursor-default transition-colors"
                      onMouseEnter={showFunctionalities}
                      onMouseLeave={hideFunctionalities}
                    >
                      <span className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4" />
                        Tính năng
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Link
                      href={`${STUDENT_BASE}/settings`}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-foreground hover:bg-muted dark:text-white/90 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Settings className="h-4 w-4 opacity-70" />
                      Cài đặt
                    </Link>
                    <ThemeToggle
                      variant="full"
                      onToggle={() => setUserMenuOpen(false)}
                      className="text-foreground hover:bg-muted dark:text-white/90 dark:hover:bg-slate-800 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-destructive hover:bg-destructive/10 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden rounded-full px-4 py-2 text-sm font-medium text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-primary-foreground dark:text-white/90 dark:hover:bg-slate-800 dark:hover:text-white transition-all duration-200 md:block focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-lg hover:bg-accent/90 dark:bg-amber-500 dark:text-slate-900 dark:hover:bg-amber-400 transition-all duration-200 active:scale-[0.98]"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/20 hover:bg-primary-foreground/10 dark:border-white/10 dark:hover:bg-slate-800 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 active:scale-[0.98]"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-primary-foreground" />
            ) : (
              <Menu className="h-5 w-5 text-primary-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-primary-foreground/20 bg-primary/95 dark:border-white/6 dark:bg-slate-900/95 dark:backdrop-blur-md">
          <nav className="container flex flex-col gap-1 px-4 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-primary-foreground/20 text-primary-foreground dark:bg-gradient-to-r dark:from-indigo-600/20 dark:to-blue-500/20 dark:text-white"
                        : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground dark:text-white/80 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? "opacity-100" : "opacity-70"}`} />
                  {item.name}
                </Link>
              );
            })}
            {isAuthenticated && (
              <div className="mt-2 border-t border-primary-foreground/20 dark:border-white/6 pt-2">
                <button
                  type="button"
                  onClick={() => setMobileFunctionalitiesOpen((o) => !o)}
                  className="flex w-full items-center justify-between gap-2 rounded-full px-4 py-3 text-sm text-primary-foreground/90 hover:bg-primary-foreground/10 dark:text-white/90 dark:hover:bg-slate-800 text-left transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 opacity-70" />
                    Tính năng
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${mobileFunctionalitiesOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileFunctionalitiesOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-white/10 pl-3">
                    {functionalityItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setMobileFunctionalitiesOpen(false);
                          }}
                          className="flex gap-3 rounded-lg px-3 py-2.5 text-sm text-primary-foreground/90 hover:bg-primary-foreground/10 dark:text-white/90 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Icon className="h-4 w-4 shrink-0 mt-0.5 opacity-70" />
                          <div className="min-w-0">
                            <span className="font-medium block">{item.name}</span>
                            <span className="text-xs text-primary-foreground/70 block mt-0.5 dark:text-white/60">
                              {item.description}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
                <Link
                  href={`${STUDENT_BASE}/settings`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-full px-4 py-3 text-sm text-primary-foreground/90 hover:bg-primary-foreground/10 dark:text-white/90 dark:hover:bg-slate-800 transition-all duration-200"
                >
                  <Settings className="h-4 w-4 opacity-70" />
                  Cài đặt
                </Link>
                <ThemeToggle
                  variant="full"
                  onToggle={() => setMobileMenuOpen(false)}
                  className="w-full justify-start rounded-full px-4 py-3 text-primary-foreground/90 hover:bg-primary-foreground/10 dark:text-white/90 dark:hover:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-full px-4 py-3 text-sm text-destructive hover:bg-destructive/10 dark:text-red-400 dark:hover:bg-red-500/10 text-left transition-all duration-200"
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
