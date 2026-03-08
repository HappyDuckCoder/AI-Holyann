"use client";

import Link from "next/link";
import Image from "next/image";
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
  GraduationCap,
  MessageCircle,
  Settings,
  LogOut,
  Sparkles,
  ClipboardList,
  FileBarChart,
  BarChart3,
  CalendarClock,
  Target,
  Building2,
  Lock,
  Crown,
  Video,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { mainFeatures, premiumFeatures } from "@/data/student-nav-features";

const STUDENT_BASE = "/student";

// ─── Main nav (always visible) ────────────────────────────────────────────────
const navItems = [
  {
    name: "Tổng quan",
    href: `${STUDENT_BASE}/dashboard`,
    icon: LayoutDashboard,
  },
  { name: "Hồ sơ", href: `${STUDENT_BASE}/profile`, icon: User },
  {
    name: "Trắc nghiệm ngành",
    href: `${STUDENT_BASE}/tests`,
    icon: ClipboardList,
  },
  { name: "Cải thiện hồ sơ", href: `${STUDENT_BASE}/improve`, icon: Sparkles },
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
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false);
  const [mobilePremiumOpen, setMobilePremiumOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const featuresTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const premiumTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFeatures = () => {
    if (featuresTimerRef.current) {
      clearTimeout(featuresTimerRef.current);
      featuresTimerRef.current = null;
    }
    if (premiumTimerRef.current) {
      clearTimeout(premiumTimerRef.current);
      premiumTimerRef.current = null;
    }
    setPremiumOpen(false);
    setFeaturesOpen(true);
  };
  const hideFeatures = () => {
    featuresTimerRef.current = setTimeout(() => setFeaturesOpen(false), 220);
  };
  const clearFeaturesTimer = () => {
    if (featuresTimerRef.current) {
      clearTimeout(featuresTimerRef.current);
      featuresTimerRef.current = null;
    }
  };

  const showPremium = () => {
    if (premiumTimerRef.current) {
      clearTimeout(premiumTimerRef.current);
      premiumTimerRef.current = null;
    }
    if (featuresTimerRef.current) {
      clearTimeout(featuresTimerRef.current);
      featuresTimerRef.current = null;
    }
    setFeaturesOpen(false);
    setPremiumOpen(true);
  };
  const hidePremium = () => {
    premiumTimerRef.current = setTimeout(() => setPremiumOpen(false), 220);
  };
  const clearPremiumTimer = () => {
    if (premiumTimerRef.current) {
      clearTimeout(premiumTimerRef.current);
      premiumTimerRef.current = null;
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
    <header className="navbar-header sticky top-0 z-50 w-full px-4 sm:px-6 md:px-8 bg-[linear-gradient(to_right,#0a3d6b,#0099c6)] dark:bg-[rgb(15_23_42/0.85)] dark:backdrop-blur-md border-b border-white/10 dark:border-white/6">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between gap-4">
        {/* ── Logo ── */}
        <div className="flex items-center gap-3">
          <Link
            href={`${STUDENT_BASE}/dashboard`}
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 rounded-lg transition-all duration-200 active:scale-[0.98]"
          >
            <div className="relative h-9 w-9 md:h-10 md:w-10 rounded-full overflow-hidden ring-2 ring-white/20 shadow-lg shadow-black/20">
              <Image
                src="/holy/1.png"
                alt="Holyann logo"
                fill
                className="object-contain"
                sizes="40px"
                priority
              />
            </div>
            <div className="flex flex-col leading-none gap-0.5">
              <span className="font-bold tracking-[0.1em] text-white drop-shadow-sm">
                HOLYANN
              </span>
              <span className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/50 md:text-[10px]">
                Học viên
              </span>
            </div>
          </Link>
        </div>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium tracking-wide transition-all duration-200 ease-in-out
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30
                  hover:scale-[1.02] active:scale-[0.98]
                  ${
                    active
                      ? "bg-white/20 text-white shadow-sm shadow-black/10"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${active ? "opacity-100" : "opacity-60"}`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* ── Right: user menu ── */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-2 py-1.5 pr-2 hover:bg-white/15 transition-all duration-200 md:px-3 md:py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 active:scale-[0.98]"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white ring-1 ring-white/20 md:h-8 md:w-8">
                  {user?.name?.charAt(0).toUpperCase() ?? "U"}
                </span>
                <span className="hidden max-w-[100px] truncate text-sm font-medium text-white xl:block">
                  {user?.name}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-white/70 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full z-50 mt-2 flex items-start gap-0 origin-top-right animate-in fade-in-0 zoom-in-95 duration-200"
                  onMouseLeave={() => {
                    hideFeatures();
                    hidePremium();
                  }}
                >
                  {/* ── Main features submenu (combobox 1) ── */}
                  {featuresOpen && (
                    <div
                      className="w-80 shrink-0 rounded-xl border border-border bg-popover dark:border-white/10 dark:bg-slate-900/95 dark:backdrop-blur-md p-2 shadow-xl text-foreground mr-0"
                      onMouseEnter={clearFeaturesTimer}
                      onMouseLeave={hideFeatures}
                    >
                      <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground dark:text-white/40">
                        Tính năng chính
                      </p>
                      {mainFeatures.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => {
                              setUserMenuOpen(false);
                              setFeaturesOpen(false);
                            }}
                            className="flex gap-3 rounded-lg px-2 py-2 text-sm text-foreground hover:bg-muted dark:text-white/90 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Icon className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground dark:text-white/50" />
                            <div className="min-w-0 flex-1">
                              <span className="font-medium block">
                                {item.name}
                              </span>
                              <span className="text-xs text-muted-foreground block mt-0.5 dark:text-white/50">
                                {item.description}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Premium features submenu (combobox 2) ── */}
                  {premiumOpen && (
                    <div
                      className="w-80 shrink-0 rounded-xl border border-amber-500/20 bg-popover dark:border-amber-500/30 dark:bg-slate-900/95 dark:backdrop-blur-md p-2 shadow-xl text-foreground mr-0"
                      onMouseEnter={clearPremiumTimer}
                      onMouseLeave={hidePremium}
                    >
                      <p className="px-2 py-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-500/80">
                        <Crown className="h-3 w-3" />
                        Premium — AI + All Advisors
                      </p>
                      {premiumFeatures.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => {
                              setUserMenuOpen(false);
                              setPremiumOpen(false);
                            }}
                            className="flex gap-3 rounded-lg px-2 py-2 text-sm text-foreground hover:bg-amber-500/5 dark:text-white/90 dark:hover:bg-amber-500/10 transition-colors"
                          >
                            <Icon className="h-4 w-4 shrink-0 mt-0.5 text-amber-500/60" />
                            <div className="min-w-0 flex-1">
                              <span className="font-medium block">
                                {item.name}
                              </span>
                              <span className="text-xs text-muted-foreground block mt-0.5 dark:text-white/50">
                                {item.description}
                              </span>
                            </div>
                            <Lock className="h-3 w-3 shrink-0 mt-1 text-amber-500/50" />
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* ── User menu ── */}
                  <div className="w-52 shrink-0 rounded-xl border border-border bg-popover dark:border-white/10 dark:bg-slate-900/95 dark:backdrop-blur-md p-1 shadow-xl text-foreground animate-in fade-in-0 zoom-in-95 duration-200">
                    <div className="px-2 py-2 border-b border-border dark:border-white/10 mb-1">
                      <p className="text-[10px] text-muted-foreground dark:text-white/50 uppercase tracking-wider">
                        Xin chào
                      </p>
                      <p className="truncate text-sm font-semibold text-foreground dark:text-white">
                        {user?.name}
                      </p>
                    </div>

                    {/* Trigger: Tính năng chính */}
                    <div
                      className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm text-foreground hover:bg-muted dark:text-white/90 dark:hover:bg-slate-800 cursor-default transition-colors"
                      onMouseEnter={showFeatures}
                      onMouseLeave={hideFeatures}
                    >
                      <span className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 opacity-60" />
                        Tính năng
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>

                    {/* Trigger: Premium */}
                    <div
                      className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm text-foreground hover:bg-amber-500/5 dark:text-white/90 dark:hover:bg-amber-500/10 cursor-default transition-colors"
                      onMouseEnter={showPremium}
                      onMouseLeave={hidePremium}
                    >
                      <span className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-amber-500/70" />
                        Premium
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <Link
                      href={`${STUDENT_BASE}/settings`}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-foreground hover:bg-muted dark:text-white/90 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Settings className="h-4 w-4 opacity-60" />
                      Cài đặt
                    </Link>

                    <ThemeToggle
                      variant="full"
                      onToggle={() => setUserMenuOpen(false)}
                      className="text-foreground hover:bg-muted dark:text-white/90 dark:hover:bg-slate-800 rounded-lg"
                    />

                    <div className="mt-1 pt-1 border-t border-border dark:border-white/10">
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
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden rounded-full px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 md:block focus:outline-none"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0a3d6b] shadow-md hover:bg-white/90 transition-all duration-200 active:scale-[0.98]"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 hover:bg-white/15 transition-all duration-200 focus:outline-none active:scale-[0.98]"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-white" />
            ) : (
              <Menu className="h-5 w-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0a3d6b]/95 dark:border-white/6 dark:bg-slate-900/95 dark:backdrop-blur-md">
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
                      ? "bg-white/20 text-white"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${active ? "opacity-100" : "opacity-60"}`}
                  />
                  {item.name}
                </Link>
              );
            })}

            {isAuthenticated && (
              <div className="mt-2 border-t border-white/10 pt-2 space-y-0.5">
                {/* Main features accordion */}
                <button
                  type="button"
                  onClick={() => setMobileFeaturesOpen((o) => !o)}
                  className="flex w-full items-center justify-between gap-2 rounded-full px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white text-left transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 opacity-60" />
                    Tính năng
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${mobileFeaturesOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {mobileFeaturesOpen && (
                  <div className="ml-4 border-l-2 border-white/10 pl-3 space-y-0.5">
                    <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                      Tính năng chính
                    </p>
                    {mainFeatures.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setMobileFeaturesOpen(false);
                          }}
                          className="flex gap-3 rounded-lg px-3 py-2.5 text-sm text-white/85 hover:bg-white/10 transition-colors"
                        >
                          <Icon className="h-4 w-4 shrink-0 mt-0.5 opacity-60" />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Premium features accordion (combobox riêng) */}
                <button
                  type="button"
                  onClick={() => setMobilePremiumOpen((o) => !o)}
                  className="flex w-full items-center justify-between gap-2 rounded-full px-4 py-3 text-sm text-white/80 hover:bg-amber-500/10 hover:text-white text-left transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-400/80" />
                    Premium
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${mobilePremiumOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {mobilePremiumOpen && (
                  <div className="ml-4 border-l-2 border-amber-400/20 pl-3 space-y-0.5">
                    <p className="px-3 py-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400/80">
                      <Crown className="h-3 w-3" /> Premium
                    </p>
                    {premiumFeatures.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setMobilePremiumOpen(false);
                          }}
                          className="flex gap-3 rounded-lg px-3 py-2.5 text-sm text-white/85 hover:bg-amber-500/10 transition-colors"
                        >
                          <Icon className="h-4 w-4 shrink-0 mt-0.5 text-amber-400/60" />
                          <span className="font-medium flex-1">
                            {item.name}
                          </span>
                          <Lock className="h-3 w-3 shrink-0 mt-0.5 text-amber-400/50" />
                        </Link>
                      );
                    })}
                  </div>
                )}

                <Link
                  href={`${STUDENT_BASE}/settings`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-full px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  <Settings className="h-4 w-4 opacity-60" />
                  Cài đặt
                </Link>
                <ThemeToggle
                  variant="full"
                  onToggle={() => setMobileMenuOpen(false)}
                  className="w-full justify-start rounded-full px-4 py-3 text-white/80 hover:bg-white/10"
                />
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 text-left transition-all duration-200"
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
