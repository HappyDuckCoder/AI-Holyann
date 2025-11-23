'use client'

import Link from 'next/link'
import {useAuth} from '../contexts/AuthContext'

export default function AuthHeader() {
    const {user, logout, isAuthenticated} = useAuth()

    return (
        <header className="bg-[#0f4c81] text-white px-8 py-5 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Link href="/">
                    <h1 className="text-2xl font-bold tracking-tight cursor-pointer">
                        HOEX <span className="text-xs font-normal opacity-80">(Holyann Explore)</span>
                    </h1>
                </Link>
                <i className="fas fa-globe-americas text-orange-400 text-sm"></i>
            </div>

            <nav className="hidden md:flex gap-8 text-sm font-medium text-blue-100">
                <Link href="/" className="text-white font-bold border-b-2 border-orange-400 pb-1">Dashboard</Link>
                <a href="#" className="hover:text-white transition">Hồ sơ</a>
                <a href="#" className="hover:text-white transition">Trường học</a>
                <a href="#" className="hover:text-white transition">Học bổng</a>
                <a href="#" className="hover:text-white transition">Cài đặt</a>
            </nav>

            <div className="flex items-center gap-3">
                {isAuthenticated ? (
                    <>
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">{user?.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-medium">Hi, {user?.name}!</span>
                        <button
                            onClick={logout}
                            className="ml-2 text-xs text-blue-200 hover:text-white transition-colors"
                        >
                            (Logout)
                        </button>
                    </>
                ) : (
                    <div className="flex gap-3">
                        <Link
                            href="/login"
                            className="px-4 py-2 text-sm font-medium bg-white text-gray-700 rounded-lg hover:bg-[#0f4c81] hover:text-white transition-colors border border-gray-300 hover:border-[#0f4c81]"
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            href="/login"
                            className="px-4 py-2 text-sm font-medium bg-white text-gray-700 rounded-lg hover:bg-[#0f4c81] hover:text-white transition-colors border border-gray-300 hover:border-[#0f4c81]"
                        >
                            Đăng ký
                        </Link>
                    </div>
                )}
            </div>
        </header>
    )
}