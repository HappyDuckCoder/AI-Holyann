'use client'

import Link from 'next/link'
import {useAuthSession} from '@/hooks/useAuthSession'
import {signOut} from 'next-auth/react'
import {useState, useEffect} from 'react'
import {usePathname} from 'next/navigation'
import {Menu, X, LayoutDashboard, Users, User, MessageCircle, Sun, Moon, LogOut, GraduationCap, CalendarClock} from 'lucide-react'

export default function MentorNavbar() {
    const {user, isAuthenticated} = useAuthSession()
    const logout = () => signOut({ callbackUrl: '/login' })
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [mounted, setMounted] = useState(false);

    // State quản lý chế độ tối - khởi tạo false để tránh hydration mismatch
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

    // Effect: Set mounted và đọc theme từ localStorage
    useEffect(() => {
        setMounted(true);

        // Đọc theme từ localStorage sau khi mounted
        try {
            const theme = localStorage.getItem('theme')
            if (theme === 'dark') {
                setIsDarkMode(true)
            } else if (theme === 'light') {
                setIsDarkMode(false)
            } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                setIsDarkMode(true)
            }
        } catch (e) {
            // noop
        }
    }, []);

    // Effect: Sync document class when isDarkMode changes
    useEffect(() => {
        if (!mounted) return

        if (isDarkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }

        // persist preference
        try {
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
        } catch (e) {
            // noop
        }
    }, [isDarkMode, mounted])

    // Hàm chuyển đổi
    const toggleTheme = () => {
        setIsDarkMode((prev) => !prev)
    }

    // Menu items for MENTOR
    const navItems = [
        {name: 'Tổng quan', href: '/mentor/dashboard', icon: LayoutDashboard},
        {name: 'Học viên', href: '/mentor/students', icon: Users},
        {name: 'Deadlines', href: '/mentor/deadlines', icon: CalendarClock},
        {name: 'Hồ sơ', href: '/mentor/profile', icon: User},
        {name: 'Trao đổi', href: '/mentor/chat', icon: MessageCircle},
    ]

    return (
        <header
            className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-4 sm:px-6 md:px-8 py-4 shadow-md flex justify-between items-center sticky top-0 z-50 transition-colors duration-300">

            {/* 1. LOGO KHU VỰC */}
            <div className="flex items-center gap-3">
                <Link href="/mentor/dashboard" className="flex items-center gap-3 group">
                    <div
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 border border-primary-foreground/20 transition-colors group-hover:border-accent md:h-10 md:w-10">
                        {/* Logo Icon */}
                        <GraduationCap className="h-4 w-4 text-accent md:h-5 md:w-5" />
                    </div>

                    {/* Typography Logo */}
                    <div className="flex flex-col justify-center leading-none">
                        <span className="font-heading font-extrabold text-base sm:text-lg md:text-xl tracking-wider text-primary-foreground group-hover:text-accent transition-colors">
                            HOLYANN
                        </span>
                        <span className="font-heading font-medium text-[0.5rem] sm:text-[0.6rem] md:text-[0.7rem] tracking-[0.3em] text-primary-foreground/90 uppercase">
                            Mentor
                        </span>
                    </div>
                </Link>
            </div>

            {/* 2. NAVIGATION */}
            <nav className="hidden md:flex items-center gap-2 lg:gap-6">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                                relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold tracking-wide transition-all
                                after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-accent after:transition-all
                                ${pathname === item.href || pathname.startsWith(item.href + '/')
                                ? 'text-primary-foreground after:w-full'
                                : 'text-primary-foreground/80 hover:text-primary-foreground after:w-0 hover:after:w-full'
                            }
                            `}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* 3. USER ACTION & THEME TOGGLE */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                {/* NÚT CHUYỂN ĐỔI THEME */}
                <button
                    onClick={toggleTheme}
                    className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-all border border-primary-foreground/10 hover:border-accent group flex-shrink-0"
                    title={mounted && isDarkMode ? "Chuyển sang chế độ Sáng" : "Chuyển sang chế độ Tối"}
                >
                    {mounted && isDarkMode ? (
                        <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-accent group-hover:rotate-90 transition-transform" />
                    ) : (
                        <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground group-hover:-rotate-12 transition-transform" />
                    )}
                </button>

                {/* Phân cách */}
                <div className="h-6 w-[1px] bg-primary-foreground/20 hidden md:block"></div>

                {isAuthenticated ? (
                    <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2">
                        <div className="text-right hidden xl:block">
                            <p className="text-xs text-white font-sans">XIN CHÀO,</p>
                            <p className="text-sm font-bold font-heading text-primary-foreground max-w-[100px] truncate">{user?.name}</p>
                        </div>

                        <div className="relative group cursor-pointer">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center text-primary-foreground font-bold border-2 border-primary-foreground/30 shadow-lg group-hover:border-accent transition-colors text-xs sm:text-sm md:text-base flex-shrink-0">
                                {(user?.name ?? '').charAt(0).toUpperCase() || '?'}
                            </div>

                            <div className="absolute right-0 top-full mt-2 w-32 bg-popover dark:bg-card rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right text-foreground z-50">
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 rounded-lg font-medium"
                                >
                                    <LogOut className="h-4 w-4" /> Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2 sm:gap-3 pl-1 sm:pl-2">
                        <Link
                            href="/login"
                            className="hidden md:block px-4 sm:px-5 py-2 text-xs sm:text-sm font-heading font-bold text-primary-foreground hover:text-accent transition-colors whitespace-nowrap"
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            href="/register"
                            className="px-4 sm:px-6 py-2 text-xs sm:text-sm font-heading font-bold bg-accent text-accent-foreground rounded-full shadow-lg hover:bg-accent/90 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-1 sm:gap-2 whitespace-nowrap"
                        >
                            Đăng ký →
                        </Link>
                    </div>
                )}

                {/* Mobile Menu Toggle Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-all border border-primary-foreground/10 hover:border-accent flex-shrink-0 ml-1"
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? (
                        <X className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                    ) : (
                        <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute left-0 right-0 top-full border-t border-primary-foreground/20 bg-primary/95 backdrop-blur-md">
                    <nav className="px-4 py-4 flex flex-col gap-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-lg font-heading text-sm font-semibold tracking-wide transition-all duration-300
                                        ${pathname === item.href || pathname.startsWith(item.href + '/')
                                        ? 'bg-primary-foreground/20 text-primary-foreground'
                                        : 'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                                    }
                                    `}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    {item.name}
                                </Link>
                            );
                        })}

                        {isAuthenticated && (
                            <div className="mt-2 pt-2 border-t border-primary-foreground/20">
                                <div className="px-4 py-2 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center text-primary-foreground font-bold border-2 border-primary-foreground/30">
                                        {(user?.name ?? '').charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <p className="text-xs text-primary-foreground/70 font-sans">XIN CHÀO,</p>
                                        <p className="text-sm font-bold font-heading text-primary-foreground">{user?.name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        logout()
                                        setMobileMenuOpen(false)
                                    }}
                                    className="w-full mt-2 px-4 py-3 rounded-lg text-sm text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 font-medium text-left flex items-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" /> Đăng xuất
                                </button>
                            </div>
                        )}
                    </nav>
                </div>
            )}
        </header>
    )
}
