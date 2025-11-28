"use client";
import React from 'react';
import {motion} from 'framer-motion';
import {Plane, GraduationCap} from 'lucide-react';
import {BRAND_COLORS} from '../../lib/data';
import Link from 'next/link';

export default function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-50">
            {/* Background Decor */}
            <div
                className="absolute top-0 right-0 w-1/3 h-full bg-blue-50 opacity-50 skew-x-12 translate-x-20 z-0"></div>

            <div
                className="container mx-auto px-4 relative z-10 text-center md:text-left flex flex-col md:flex-row items-center">

                {/* Left Content */}
                <motion.div
                    initial={{opacity: 0, x: -50}}
                    animate={{opacity: 1, x: 0}}
                    transition={{duration: 0.8}}
                    className="md:w-1/2"
                >
                    <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6`}>
                        <Plane className="w-4 h-4 rotate-45"/> Future by Design
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-slate-900 mb-6">
                        Vẽ Đường Tương Lai <br/>
                        <span className={BRAND_COLORS.textGradient}>Định Hình Ngày Mai</span>
                    </h1>
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
                        Holyann Explore trao cho bạn một chiếc chìa khóa vạn năng để bạn có thể tự tin mở
                        cánh cửa tương lai và kiến tạo thành công rực rỡ của riêng mình.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <Link
                            href="/dashboard"
                            className={`${BRAND_COLORS.primaryGradient} text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-blue-500/30 transition-all hover:-translate-y-1 inline-flex items-center justify-center`}
                        >
                            Khám Phá Ngay
                        </Link>
                        <button
                            onClick={() => document.getElementById('services')?.scrollIntoView({behavior: 'smooth'})}
                            className="px-8 py-4 rounded-full font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all">
                            Tìm Hiểu Thêm
                        </button>
                    </div>
                </motion.div>

                {/* Right Image */}
                <motion.div
                    initial={{opacity: 0, scale: 0.9}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{duration: 0.8, delay: 0.2}}
                    className="md:w-1/2 mt-12 md:mt-0 relative"
                >
                    <div
                        className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-slate-200">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent z-10"></div>
                        {/* TODO: Thay thế thẻ div này bằng thẻ <Image /> của Next.js khi có ảnh thật */}
                        <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-400">
                            <span className="text-center font-medium">[Hình ảnh học sinh/Máy bay giấy]</span>
                        </div>
                    </div>

                    {/* Floating Badge */}
                    <div
                        className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl z-20 max-w-xs animate-bounce-slow hidden md:block">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-amber-100 p-2 rounded-full"><GraduationCap
                                className="text-amber-500 w-5 h-5"/></div>
                            <span className="font-bold text-slate-900">Săn Học Bổng</span>
                        </div>
                        <p className="text-xs text-slate-500">Đồng hành chinh phục các trường TOP đầu thế giới.</p>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}