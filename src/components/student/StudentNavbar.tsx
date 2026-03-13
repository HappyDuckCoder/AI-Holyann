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
  Settings,
  LogOut,
  Sparkles,
  ClipboardList,
  Crown,
  Lock,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { mainFeatures, premiumFeatures } from "@/data/student-nav-features";
import { useSubscription } from "@/hooks/useSubscription";

const STUDENT_BASE = "/student";

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
  const { isPaid } = useSubscription();
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
    if (featuresTimerRef.current) clearTimeout(featuresTimerRef.current);
    if (premiumTimerRef.current) clearTimeout(premiumTimerRef.current);
    setPremiumOpen(false);
    setFeaturesOpen(true);
  };
  const hideFeatures = () => {
    featuresTimerRef.current = setTimeout(() => setFeaturesOpen(false), 220);
  };
  const clearFeaturesTimer = () => {
    if (featuresTimerRef.current) clearTimeout(featuresTimerRef.current);
  };

  const showPremium = () => {
    if (premiumTimerRef.current) clearTimeout(premiumTimerRef.current);
    if (featuresTimerRef.current) clearTimeout(featuresTimerRef.current);
    setFeaturesOpen(false);
    setPremiumOpen(true);
  };
  const hidePremium = () => {
    premiumTimerRef.current = setTimeout(() => setPremiumOpen(false), 220);
  };
  const clearPremiumTimer = () => {
    if (premiumTimerRef.current) clearTimeout(premiumTimerRef.current);
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
    <header
      className="font-university-sans sticky top-0 z-50 w-full px-4 sm:px-6 md:px-8
        bg-gradient-to-r from-[var(--primary)] via-[var(--brand-deep)] to-[var(--brand-cyan)]
        dark:from-[var(--secondary)] dark:via-[var(--brand-deep-darker)] dark:to-[var(--primary)]
        border-b-2 border-white/20 dark:border-primary/30
        shadow-[0_2px_8px_-2px_rgba(0,0,0,0.12)]
        dark:shadow-[0_2px_10px_-2px_rgba(0,0,0,0.35)]"
    >
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none dark:via-primary/40" />

      <div className="container flex h-16 max-w-screen-2xl items-center justify-between gap-4">
        {/* ── Logo ── */}
        <div className="flex items-center gap-3">
            <Link
            href={`${STUDENT_BASE}/dashboard`}
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-primary rounded-lg transition-all duration-200 active:scale-[0.97]"
          >
            <div className="relative h-11 w-11 md:h-12 md:w-12 shrink-0 group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(255,255,255,0.15)] dark:drop-shadow-[0_0_12px_var(--primary)/0.4]">
              <Image
                src="/logo/logo HoEx (3).png"
                alt="HOEX logo"
                fill
                className="object-contain mix-blend-lighten"
                sizes="56px"
                priority
              />
              <span className="absolute -bottom-1 -right-5 rounded-full bg-secondary text-primary font-bold text-[7px] uppercase tracking-wide px-1.5 py-0.5 leading-none whitespace-nowrap ring-1 ring-white/30 dark:bg-primary dark:text-primary-foreground dark:ring-primary-foreground/20">
                HỌC VIÊN
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
                className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium tracking-wide transition-all duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40
                  hover:scale-[1.02] active:scale-[0.98]
                  ${
                    active
                      ? "bg-white/20 text-white ring-1 ring-white/25 shadow-sm"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "opacity-70"}`} />
                {item.name}
                {active && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Right: user menu (ẩn trên mobile; dùng menu hamburger thay combobox) ── */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2 py-1.5 pr-2 md:px-3 md:py-2 hover:bg-white/15 hover:border-white/30 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 active:scale-[0.98]"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <span className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-white/90 text-primary text-sm font-bold ring-1 ring-white/50 shadow-md">
                  {user?.name?.charAt(0).toUpperCase() ?? "U"}
                </span>
                <span className="hidden max-w-[100px] truncate text-sm font-medium text-white xl:block">
                  {user?.name}
                </span>
                <ChevronDown className={`h-4 w-4 text-white/80 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full z-50 mt-2 flex items-start gap-0 origin-top-right animate-in fade-in-0 zoom-in-95 duration-200"
                  onMouseLeave={() => {
                    hideFeatures();
                    hidePremium();
                  }}
                >
                  {/* ── Main features submenu ── */}
                  {featuresOpen && (
                    <div
                      className="w-80 shrink-0 rounded-xl border border-[#0077b6]/20 dark:border-[#00b4e6]/15
                        bg-white dark:bg-[#060d1a]/98 dark:backdrop-blur-xl
                        p-2 shadow-2xl shadow-[#0077b6]/10 dark:shadow-[#00b4e6]/10 text-foreground mr-0"
                      onMouseEnter={clearFeaturesTimer}
                      onMouseLeave={hideFeatures}
                    >
                      <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#0077b6] dark:text-[#38bdf8]/60">
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
                            className="flex gap-3 rounded-lg px-2 py-2 text-sm
                              text-foreground hover:bg-[#0077b6]/5
                              dark:text-white/90 dark:hover:bg-[#00b4e6]/8
                              transition-colors group/item"
                          >
                            <Icon className="h-4 w-4 shrink-0 mt-0.5 text-[#0077b6]/60 dark:text-[#38bdf8]/50 group-hover/item:text-[#0077b6] dark:group-hover/item:text-[#38bdf8] transition-colors" />
                            <div className="min-w-0 flex-1">
                              <span className="font-semibold block">
                                {item.name}
                              </span>
                              <span className="text-xs text-muted-foreground dark:text-white/40 block mt-0.5">
                                {item.description}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Premium features submenu (free user: làm mờ, link sang pricing) ── */}
                  {premiumOpen && (
                    <div
                      className="w-80 shrink-0 rounded-xl border border-accent/30 bg-card p-2 shadow-xl text-foreground mr-0"
                      onMouseEnter={clearPremiumTimer}
                      onMouseLeave={hidePremium}
                    >
                      <p className="px-2 py-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent">
                        <Crown className="h-3 w-3" />
                        Premium — AI + All Advisors
                      </p>
                      {premiumFeatures.map((item) => {
                        const Icon = item.icon;
                        const isLocked = !isPaid;
                        if (isLocked) {
                          return (
                            <Link
                              key={item.name}
                              href={`${STUDENT_BASE}/pricing`}
                              onClick={() => {
                                setUserMenuOpen(false);
                                setPremiumOpen(false);
                              }}
                              className="flex gap-3 rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-amber-500/10 transition-colors opacity-75 hover:opacity-100 border border-transparent hover:border-amber-500/20"
                            >
                              <Icon className="h-4 w-4 shrink-0 mt-0.5 text-amber-500/60" />
                              <div className="min-w-0 flex-1">
                                <span className="font-semibold block text-foreground/80">{item.name}</span>
                                <span className="text-xs text-muted-foreground block mt-0.5">{item.description}</span>
                                <span className="mt-1 inline-block text-[10px] font-medium text-amber-600 dark:text-amber-400">Nâng cấp để mở khóa</span>
                              </div>
                              <Lock className="h-3 w-3 shrink-0 mt-1 text-amber-500/70" />
                            </Link>
                          );
                        }
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => {
                              setUserMenuOpen(false);
                              setPremiumOpen(false);
                            }}
                            className="flex gap-3 rounded-lg px-2 py-2 text-sm text-foreground hover:bg-accent/5 transition-colors"
                          >
                            <Icon className="h-4 w-4 shrink-0 mt-0.5 text-accent/80" />
                            <div className="min-w-0 flex-1">
                              <span className="font-semibold block">{item.name}</span>
                              <span className="text-xs text-muted-foreground block mt-0.5">{item.description}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* ── User dropdown ── */}
                  <div className="w-52 shrink-0 rounded-xl border border-border bg-card p-1 shadow-xl text-foreground">
                    <div className="px-2 py-2 border-b border-border mb-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                        Xin chào
                      </p>
                      <p className="truncate text-sm font-bold text-foreground">
                        {user?.name}
                      </p>
                    </div>

                    <div
                      className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm text-foreground hover:bg-muted cursor-default transition-colors"
                      onMouseEnter={showFeatures}
                      onMouseLeave={hideFeatures}
                    >
                      <span className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        Tính năng
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div
                      className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm text-foreground hover:bg-muted cursor-default transition-colors"
                      onMouseEnter={showPremium}
                      onMouseLeave={hidePremium}
                    >
                      <span className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-accent" />
                        Premium
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <Link
                      href={`${STUDENT_BASE}/settings`}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      Cài đặt
                    </Link>

                    <ThemeToggle variant="full" onToggle={() => setUserMenuOpen(false)} className="text-foreground hover:bg-muted rounded-lg" />

                    <div className="mt-1 pt-1 border-t border-border">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
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
                className="hidden rounded-full px-4 py-2 text-sm font-medium text-white/85 hover:bg-white/15 hover:text-white transition-all duration-200 md:block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-full px-4 py-2 text-sm font-bold bg-white text-primary shadow-md hover:bg-white/95 hover:shadow-lg transition-all duration-200 active:scale-[0.97]"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 hover:bg-white/20 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 active:scale-[0.97]"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white/90" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-primary/95 dark:bg-background/98 backdrop-blur-sm">
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
                    active ? "bg-white/20 text-white ring-1 ring-white/20" : "text-white/85 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? "opacity-100" : "opacity-70"}`} />
                  {item.name}
                </Link>
              );
            })}

            {isAuthenticated && (
              <div className="mt-2 border-t border-white/10 pt-2 space-y-0.5">
                <button
                  type="button"
                  onClick={() => setMobileFeaturesOpen((o) => !o)}
                  className="flex w-full items-center justify-between gap-2 rounded-full px-4 py-3 text-sm text-white/85 hover:bg-white/10 hover:text-white text-left transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 opacity-70" />
                    Tính năng
                  </span>
                  <ChevronDown className={`h-4 w-4 opacity-70 transition-transform duration-200 ${mobileFeaturesOpen ? "rotate-180" : ""}`} />
                </button>

                {mobileFeaturesOpen && (
                  <div className="ml-4 border-l-2 border-white/15 pl-3 space-y-0.5">
                    <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/50">
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
                          <Icon className="h-4 w-4 shrink-0 mt-0.5 opacity-70" />
                          <span className="font-semibold">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setMobilePremiumOpen((o) => !o)}
                  className="flex w-full items-center justify-between gap-2 rounded-full px-4 py-3 text-sm text-white/85 hover:bg-accent/15 hover:text-white text-left transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-accent" />
                    Premium
                  </span>
                  <ChevronDown className={`h-4 w-4 text-accent/70 transition-transform duration-200 ${mobilePremiumOpen ? "rotate-180" : ""}`} />
                </button>

                {mobilePremiumOpen && (
                  <div className="ml-4 border-l-2 border-accent/20 pl-3 space-y-0.5">
                    <p className="px-3 py-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent/80">
                      <Crown className="h-3 w-3" /> Premium
                    </p>
                    {premiumFeatures.map((item) => {
                      const Icon = item.icon;
                      const isLocked = !isPaid;
                      return (
                        <Link
                          key={item.name}
                          href={isLocked ? `${STUDENT_BASE}/pricing` : item.href}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setMobilePremiumOpen(false);
                          }}
                          className={`flex gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${isLocked ? "text-white/60 hover:bg-amber-500/10" : "text-white/85 hover:bg-accent/10"}`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${isLocked ? "text-amber-400/70" : "text-accent/90"}`} />
                          <span className="font-semibold flex-1">{item.name}</span>
                          {isLocked && <span className="text-[10px] text-amber-300/90">Nâng cấp</span>}
                          <Lock className="h-3 w-3 shrink-0 mt-0.5 text-accent/60" />
                        </Link>
                      );
                    })}
                  </div>
                )}

                <Link
                  href={`${STUDENT_BASE}/settings`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-full px-4 py-3 text-sm text-white/85 hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  <Settings className="h-4 w-4 opacity-70" />
                  Cài đặt
                </Link>

                <ThemeToggle variant="full" onToggle={() => setMobileMenuOpen(false)} className="w-full justify-start rounded-full px-4 py-3 text-white/85 hover:bg-white/10" />

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-full px-4 py-3 text-sm text-destructive hover:bg-destructive/15 text-left transition-all duration-200"
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
