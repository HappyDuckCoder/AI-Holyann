"use client";
import React, {useState} from 'react';
import {motion} from 'framer-motion';
import {CheckCircle2, Lightbulb} from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import {BRAND_COLORS} from '../../lib/data';

export default function ServicesSection() {
    const [activeServiceTab, setActiveServiceTab] = useState<'comprehensive' | 'essay'>('comprehensive');

    return (
        <section id="dich-vu" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <SectionHeading subtitle="Giải Pháp Của Chúng Tôi">Dịch Vụ Cung Cấp</SectionHeading>

                {/* Tab Toggle */}
                <div className="flex justify-center mb-12">
                    <div className="bg-slate-100 p-1 rounded-full flex gap-2">
                        <button
                            onClick={() => setActiveServiceTab('comprehensive')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeServiceTab === 'comprehensive' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Gói Toàn Diện 1-1
                        </button>
                        <button
                            onClick={() => setActiveServiceTab('essay')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeServiceTab === 'essay' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Gói Sửa Luận (Lẻ)
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto">
                    {activeServiceTab === 'comprehensive' ? (
                        // Nội dung gói toàn diện (Copy từ code cũ)
                        <motion.div
                            initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}}
                            className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
                        >
                            {/* ... Paste nội dung card Comprehensive vào đây ... */}
                            <div className={`p-8 text-white ${BRAND_COLORS.primaryGradient}`}>
                                <h3 className="text-2xl font-bold mb-2">Gói Tư Vấn Toàn Diện 1-1</h3>
                                <p className="opacity-90">Đồng hành trong vòng 1 năm (8 - 16 tháng).</p>
                            </div>
                            {/* ... */}
                        </motion.div>
                    ) : (
                        // Nội dung gói luận (Copy từ code cũ)
                        <motion.div
                            initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}}
                            className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
                        >
                            {/* ... Paste nội dung card Essay vào đây ... */}
                            <div className="p-8 bg-slate-900 text-white">
                                <h3 className="text-2xl font-bold mb-2">Gói Lẻ Sửa Luận Chính</h3>
                            </div>
                            {/* ... */}
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
}