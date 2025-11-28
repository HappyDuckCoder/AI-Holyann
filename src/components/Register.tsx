"use client"
import Image from 'next/image'
import {useState} from 'react'
import Link from 'next/link'

interface RegisterProps {
    onRegister: (email: string, name: string) => void
}

export default function Register({onRegister}: RegisterProps) {
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault()
        // Simple validation
        if (registerData.password !== registerData.confirmPassword) {
            alert('Mật khẩu không khớp!')
            return
        }

        if (registerData.password.length < 6) {
            alert('Mật khẩu phải có ít nhất 6 ký tự!')
            return
        }

        onRegister(registerData.email, registerData.name)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRegisterData({
            ...registerData,
            [e.target.name]: e.target.value
        })
    }

    return (
        <div
            className="w-full max-w-5xl bg-white dark:bg-card rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100 dark:border-white/10 transition-all duration-300">

            {/* 1. LEFT SIDE - IMAGE (Banner) */}
            <div className="w-full md:w-1/2 relative h-64 md:h-auto min-h-[400px] md:min-h-[600px]">
                <Image
                    src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=600&fit=crop"
                    alt="University Campus"
                    fill
                    className="object-cover"
                    loading="eager"
                    priority
                />
                {/* Overlay Gradient giúp chữ dễ đọc hơn */}
                <div
                    className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/20 mix-blend-multiply"></div>

                <div className="absolute bottom-8 left-8 right-8 text-white z-10">
                    <h2 className="text-3xl font-heading font-bold mb-2 text-white">Holyann Explore</h2>
                    <p className="text-lg opacity-90 font-sans">Your Gateway to Global Education</p>
                </div>
            </div>

            {/* 2. RIGHT SIDE - FORM */}
            <div
                className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-card transition-colors overflow-y-auto">
                <div className="max-w-md mx-auto w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-heading font-bold text-primary dark:text-sky-400 mb-2">Đăng
                            Ký</h1>
                        <p className="text-muted-foreground">Tham gia để bắt đầu hành trình du học của bạn</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                                Họ và Tên
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={registerData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-muted/30 dark:bg-muted/50 border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                                placeholder="Nhập họ và tên"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={registerData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-muted/30 dark:bg-muted/50 border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={registerData.password}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-muted/30 dark:bg-muted/50 border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword"
                                   className="block text-sm font-semibold text-foreground mb-2">
                                Xác nhận mật khẩu
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={registerData.confirmPassword}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-muted/30 dark:bg-muted/50 border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-white font-heading font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                            Tạo Tài Khoản
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-muted-foreground">
                        Đã có tài khoản?{' '}
                        <Link href="/login" className="text-accent hover:underline font-bold">
                            Đăng nhập ngay
                        </Link>
                    </p>

                    {/* Social Login Options */}
                    <div className="mt-8">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"/>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span
                                    className="px-3 bg-white dark:bg-card text-muted-foreground">Hoặc đăng ký nhanh</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-xl hover:bg-muted transition-colors dark:text-white group">
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                    <path fill="#4285F4"
                                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853"
                                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05"
                                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335"
                                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                <span className="font-medium text-sm">Google</span>
                            </button>

                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-xl hover:bg-muted transition-colors dark:text-white group">
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="#1877F2"
                                     viewBox="0 0 24 24">
                                    <path
                                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                                <span className="font-medium text-sm">Facebook</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

