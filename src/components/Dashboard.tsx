"use client"
import Link from 'next/link'

interface DashboardProps {
    userName: string
}

export default function Dashboard({userName}: DashboardProps) {
    const isAuthenticated = userName !== 'Khách'

    return (
        <div
            className="w-full max-w-5xl mx-auto bg-gray-50 shadow-2xl rounded-3xl overflow-hidden min-h-[800px] flex flex-col">
            {/* Welcome Section for Non-authenticated Users */}
            {!isAuthenticated && (
                <div className="bg-gradient-to-r from-[#0f4c81] to-blue-600 text-white p-8 text-center">
                    <h1 className="text-3xl font-bold mb-4">Chào mừng đến với Holyann Explore</h1>
                    <p className="text-blue-100 mb-6">Nền tảng AI hàng đầu cho du học và định cư</p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/login"
                            className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg hover:bg-[#0f4c81] hover:text-white transition-colors border border-gray-300 hover:border-[#0f4c81]"
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            href="/login"
                            className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg hover:bg-[#0f4c81] hover:text-white transition-colors border border-gray-300 hover:border-[#0f4c81]"
                        >
                            Đăng ký
                        </Link>
                    </div>
                </div>
            )}

            <main className="flex-1 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                    {/* Achievement Section */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm flex flex-col justify-center">
                        <h2 className="text-gray-600 font-bold text-lg mb-6">Thành tựu nổi bật</h2>
                        <div className="space-y-8">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <i className="fas fa-graduation-cap text-3xl text-[#0f4c81]"></i>
                                </div>
                                <div className="text-5xl font-extrabold text-[#0f4c81]">2,500+</div>
                                <div className="text-gray-400 text-sm mt-1">học viên trúng tuyển</div>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="text-4xl font-bold text-[#0f4c81]">15+</div>
                                    <i className="fas fa-globe text-3xl text-[#0f4c81]"></i>
                                </div>
                                <div className="text-gray-400 text-sm mt-1">Quốc gia hỗ trợ</div>
                            </div>
                        </div>
                    </div>

                    {/* Latest Study Abroad News */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm flex flex-col">
                        <h2 className="text-gray-600 font-bold text-lg mb-8">Thông tin Du học mới nhất</h2>
                        <div className="space-y-6 flex-1">
                            <div className="flex items-start gap-4">
                                <i className="far fa-clock text-[#0f4c81] text-xl mt-1"></i>
                                <div>
                                    <p className="text-[#0f4c81] font-semibold text-sm">Deadline học bổng Mỹ - Fall
                                        2024</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <i className="far fa-clock text-[#0f4c81] text-xl mt-1"></i>
                                <div>
                                    <p className="text-[#0f4c81] font-semibold text-sm">Sự kiện Triển lãm Du
                                        học <br/> Anh Quốc</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <i className="far fa-clock text-[#0f4c81] text-xl mt-1"></i>
                                <div>
                                    <p className="text-[#0f4c81] font-semibold text-sm">Kinh nghiệm phỏng vấn Visa
                                        J-1</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm flex flex-col justify-between">
                        <div>
                            <h2 className="text-gray-600 font-bold text-lg mb-4">Kết nối với chúng tôi</h2>
                            <h3 className="text-gray-800 font-bold text-sm mb-2">Thông tin liên hệ:</h3>
                            <div className="text-xs text-gray-400 space-y-1 mb-6 leading-relaxed">
                                <p>Địa chỉ: Tầng 12, Tòa nhà TechHub</p>
                                <p>11 Duy Tân, Cầu Giấy, Hà Nội</p>
                                <p>Hotline: 1900 123 456</p>
                                <p>Email: support@holyann.vn</p>
                            </div>
                            <div className="flex gap-3 mb-6">
                                <a href="#"
                                   className="w-8 h-8 rounded-full bg-[#0f4c81] text-white flex items-center justify-center hover:opacity-90 transition"><i
                                    className="fab fa-facebook-f"></i></a>
                                <a href="#"
                                   className="w-8 h-8 rounded-full bg-[#0f4c81] text-white flex items-center justify-center hover:opacity-90 transition"><i
                                    className="fab fa-instagram"></i></a>
                                <a href="#"
                                   className="w-8 h-8 rounded-full bg-[#0f4c81] text-white flex items-center justify-center hover:opacity-90 transition"><i
                                    className="fab fa-linkedin-in"></i></a>
                            </div>
                        </div>
                        <button
                            className="w-full py-3 bg-[#f5a623] text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:opacity-90 transition transform active:scale-95">
                            Liên hệ tư vấn ngay
                        </button>
                    </div>

                    {/* Personalized Recommendations */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm flex flex-col">
                        <h2 className="text-gray-600 font-bold text-lg mb-6">Dành cho bạn</h2>
                        <div className="flex flex-col gap-4 flex-1 justify-center">
                            <a href="#"
                               className="block w-full py-4 px-6 bg-[#e6f0f8] rounded-full text-[#0f4c81] font-semibold text-sm hover:bg-blue-100 transition text-center truncate">
                                Gợi ý lộ trình <span className="font-bold">du học ngành Marketing</span>
                            </a>
                            <a href="#"
                               className="block w-full py-4 px-6 bg-[#e6f0f8] rounded-full text-[#0f4c81] font-semibold text-sm hover:bg-blue-100 transition text-center truncate">
                                Top 5 học bổng cho sinh viên nghệ thuật
                            </a>
                            <a href="#"
                               className="block w-full py-4 px-6 bg-[#e6f0f8] rounded-full text-[#0f4c81] font-semibold text-sm hover:bg-blue-100 transition text-center truncate">
                                Ebook: Bí quyết săn không toàn phần
                            </a>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="py-4 text-center text-[10px] text-gray-400 border-t border-gray-100 bg-white">
                Bản quyền © 2025 HOLYANN EXPLORE. | Chính sách bảo mật | Điều khoản sử dụng
            </footer>
        </div>
    )
}