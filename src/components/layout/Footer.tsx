"use client";
import React from 'react';
import {Mail, Facebook, Instagram} from 'lucide-react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTiktok} from '@fortawesome/free-brands-svg-icons';
import {BRAND_COLORS} from '../../lib/data'; // Sử dụng đường dẫn tương đối để tránh lỗi

export default function Footer() {
    return (
        <footer id="contact" className="bg-[var(--footer-bg)] text-slate-300 py-16 border-t border-slate-800">
            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12">

                {/* Cột 1: Thông tin thương hiệu */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        {/* Logo text */}
                        <span className={`text-2xl font-bold ${BRAND_COLORS.textGradient}`}>HOLYANN</span>
                        <span className="text-2xl font-bold text-white">EXPLORE</span>
                    </div>
                    <p className="mb-6 opacity-80 text-sm leading-relaxed">
                        Future by Design - Vẽ đường tương lai, định hình ngày mai. Chúng tôi đồng hành cùng bạn chinh
                        phục giấc mơ du học.
                    </p>

                    {/* Social Icons */}
                    <div className="flex gap-4">
                        <a href="#"
                           className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--brand-blue)] transition-all hover:-translate-y-1">
                            <Facebook size={18} className="text-white"/>
                        </a>
                        <a href="#"
                           className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--instagram)] transition-all hover:-translate-y-1">
                            <Instagram size={18} className="text-white"/>
                        </a>
                        <a href="#"
                           className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/25 transition-all hover:-translate-y-1">
                            <FontAwesomeIcon icon={faTiktok} className="text-white text-lg"/>
                        </a>
                    </div>
                </div>

                {/* Cột 2: Liên hệ nhanh (Dữ liệu từ Booklet) */}
                <div>
                    <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm border-b border-slate-700 pb-2 inline-block">
                        Thông Tin Liên Hệ
                    </h4>
                    <ul className="space-y-4 text-sm">
                        <li className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-blue-500 shrink-0"/>
                            <a href="mailto:holyann.contact@gmail.com"
                               className="hover:text-blue-400 transition-colors break-all">
                                holyann.contact@gmail.com
                            </a>
                        </li>
                        <li className="flex items-start gap-3">
                            <Facebook className="w-5 h-5 text-blue-500 shrink-0"/>
                            <a href="https://www.facebook.com/holyannxplore"
                               target="_blank"
                               rel="noopener noreferrer"
                               className="hover:text-blue-400 transition-colors">
                                Holyann Explore
                            </a>
                        </li>
                        <li className="flex items-start gap-3">
                            <Instagram className="w-5 h-5 text-blue-500 shrink-0"/>
                            <a href="https://www.instagram.com/holyannexplore/"
                               target="_blank"
                               rel="noopener noreferrer"
                               className="hover:text-blue-400 transition-colors">
                                @holyannexplore
                            </a>
                        </li>
                        <li className="flex items-start gap-3">
                            <FontAwesomeIcon icon={faTiktok} className="text-blue-500 text-lg shrink-0 mt-0.5"/>
                            <a href="https://www.tiktok.com/@holyannexplore"
                               target="_blank"
                               rel="noopener noreferrer"
                               className="hover:text-blue-400 transition-colors">
                                @holyannexplore
                            </a>
                        </li>
                    </ul>
                </div>

            </div>

            {/* Copyright Bar */}
            <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs opacity-50">
                <p>© 2025 Holyann Explore - Vẽ đường tương lai. Bảo lưu mọi quyền.</p>
            </div>
        </footer>
    );
}