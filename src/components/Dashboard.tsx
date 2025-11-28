"use client"
import Link from 'next/link'

interface DashboardProps {
    userName: string
}

export default function Dashboard({userName}: DashboardProps) {
    const isAuthenticated = userName !== 'Khách'

    return (
        // SỬA 1: Container chính
        // Thay bg-muted/50 bằng bg-blue-50/50 cho sáng và dark:bg-card/20 cho tối để tiệp màu nền
        <div
            className="w-full max-w-5xl mx-auto bg-muted/50 dark:bg-card/20 shadow-2xl rounded-3xl overflow-hidden min-h-[800px] flex flex-col font-sans transition-colors duration-300 backdrop-blur-sm border border-border">

            {/* 1. Welcome Section */}
            {!isAuthenticated && (
                <div
                    className="bg-gradient-to-r from-primary to-secondary text-white p-10 text-center relative overflow-hidden">
                    <div
                        className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                    <div className="relative z-10">
                        <h1 className="text-3xl font-heading font-bold mb-3 tracking-wide">
                            Chào mừng đến với Holyann Explore
                        </h1>
                        <p className="text-foreground/80 mb-8 text-lg font-light">
                            Nền tảng AI hàng đầu cho du học và định cư
                        </p>

                        <div className="flex gap-4 justify-center">
                            <Link href="/login"
                                  className="px-8 py-3 bg-popover text-primary font-heading font-bold rounded-lg hover:bg-muted transition-all shadow-lg hover:-translate-y-1">
                                Đăng nhập
                            </Link>
                            <Link href="/register"
                                  className="px-8 py-3 bg-transparent border-2 border-primary-foreground text-primary-foreground font-heading font-bold rounded-lg hover:bg-primary-foreground/10 transition-all">
                                Đăng ký
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">

                    {/* 2. Achievement Section */}
                    <div className="card-holyann flex flex-col justify-center items-start">
                        <h2 className="section-title text-lg !mb-6 !text-left after:!mx-0 after:!w-10">
                            THÀNH TỰU NỔI BẬT
                        </h2>

                        <div className="space-y-8 w-full">
                            <div className="group">
                                <div className="flex items-center gap-4 mb-2">
                                    <div
                                        className="w-12 h-12 rounded-full bg-muted dark:bg-card/10 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                                        <i className="fas fa-graduation-cap text-2xl text-primary group-hover:text-primary-foreground transition-colors"></i>
                                    </div>
                                    <div
                                        className="text-5xl font-heading font-extrabold text-primary">
                                        2,500+
                                    </div>
                                </div>
                                <div className="text-muted-foreground text-sm font-medium pl-16">
                                    học viên trúng tuyển
                                </div>
                            </div>

                            <div className="group">
                                <div className="flex items-center gap-4 mb-2">
                                    <div
                                        className="w-12 h-12 rounded-full bg-muted dark:bg-card/10 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                                        <i className="fas fa-globe text-2xl text-primary group-hover:text-primary-foreground transition-colors"></i>
                                    </div>
                                    <div className="text-4xl font-heading font-bold text-primary">
                                        15+
                                    </div>
                                </div>
                                <div className="text-muted-foreground text-sm font-medium pl-16">
                                    Quốc gia hỗ trợ
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Latest News */}
                    <div className="card-holyann flex flex-col">
                        <h2 className="section-title text-lg !mb-6 !text-left after:!mx-0 after:!w-10">
                            THÔNG TIN MỚI NHẤT
                        </h2>

                        <div className="space-y-6 flex-1">
                            {[
                                "Deadline học bổng Mỹ - Fall 2024",
                                "Sự kiện Triển lãm Du học Anh Quốc",
                                "Kinh nghiệm phỏng vấn Visa J-1"
                            ].map((item, index) => (
                                <div key={index}
                                     className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer group">
                                    <i className="far fa-clock text-secondary text-xl mt-1 group-hover:scale-110 transition-transform"></i>
                                    <div>
                                        <p className="text-foreground font-semibold text-sm group-hover:text-primary transition-colors">
                                            {item}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. Contact Info */}
                    <div className="card-holyann flex flex-col justify-between">
                        <div>
                            <h2 className="section-title text-lg !mb-4 !text-left after:!mx-0 after:!w-10">
                                KẾT NỐI VỚI CHÚNG TÔI
                            </h2>

                            <div className="space-y-3 mb-8 text-sm text-muted-foreground leading-relaxed">
                                <p><strong className="text-primary dark:text-sky-400">Địa chỉ:</strong> Tầng 12, Tòa nhà
                                    TechHub, 11 Duy Tân, Cầu Giấy, HN</p>
                                <p><strong className="text-primary dark:text-sky-400">Hotline:</strong> 1900 123 456</p>
                                <p><strong className="text-primary dark:text-sky-400">Email:</strong> support@holyann.vn
                                </p>
                            </div>

                            <div className="flex gap-3 mb-6">
                                {['facebook-f', 'instagram', 'linkedin-in', 'tiktok'].map((icon) => (
                                    <a key={icon} href="#"
                                       className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-secondary hover:-translate-y-1 transition-all shadow-md">
                                        <i className={`fab fa-${icon}`}></i>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <button
                            className="w-full py-3 bg-accent text-accent-foreground font-heading font-bold rounded-xl shadow-md hover:shadow-lg hover:bg-accent/90 transition-all transform active:scale-95">
                            Liên hệ tư vấn ngay
                        </button>
                    </div>

                    {/* 5. Personalized Recommendations */}
                    <div className="card-holyann flex flex-col">
                        <h2 className="section-title text-lg !mb-6 !text-left after:!mx-0 after:!w-10">
                            DÀNH CHO BẠN
                        </h2>

                        <div className="flex flex-col gap-4 flex-1 justify-center">
                            {[
                                {text: "Gợi ý lộ trình du học ngành Marketing", highlight: true},
                                {text: "Top 5 học bổng cho sinh viên nghệ thuật", highlight: false},
                                {text: "Ebook: Bí quyết săn không toàn phần", highlight: false}
                            ].map((item, idx) => (
                                <a key={idx} href="#"
                                   className="group relative block w-full py-4 px-6 bg-muted/50 dark:bg-card/10 rounded-full text-primary font-medium text-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-center border border-border">
                                    {item.highlight ? (
                                        <>Gợi ý lộ trình <span
                                            className="font-bold group-hover:text-accent">du học ngành Marketing</span></>
                                    ) : (
                                        item.text
                                    )}
                                    <i className="fas fa-arrow-right absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all"></i>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* SỬA 2: Footer */}
            {/* Thay bg-white bằng bg-white dark:bg-transparent để trong suốt hoặc theo màu nền */}
            <footer
                className="py-6 text-center text-xs text-muted-foreground border-t border-border bg-background font-sans transition-colors duration-300">
                Bản quyền © 2025 <span
                className="text-primary dark:text-sky-400 font-heading font-bold">HOLYANN EXPLORE</span>. | Chính sách
                bảo mật | Điều khoản sử dụng
            </footer>
        </div>
    )
}
