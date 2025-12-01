"use client";
import React from 'react';
import SectionHeading from '@/components/ui/SectionHeading';

import {BRAND_COLORS, HIGHLIGHTS, TESTIMONIALS} from '../../lib/data';

export default function TestimonialsSection() {
    return (
        <section id="trai-nghiem" className="py-20 bg-slate-900 text-white">
            <div className="container mx-auto px-4">
                <SectionHeading subtitle="Câu Chuyện Thành Công">Trải Nghiệm Học Viên</SectionHeading>

                {/* Horizontal Scroll Container */}
                <div
                    className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory px-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible no-scrollbar">
                    {TESTIMONIALS.map((item, idx) => (
                        <div key={idx}
                             className="snap-center shrink-0 w-[85vw] md:w-auto bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700 flex flex-col h-full hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden shrink-0">
                                    {/* Avatar Placeholder */}
                                    <div
                                        className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-500 text-xs font-bold">HV
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-white">{item.name}</h4>
                                    <p className="text-xs text-blue-400 font-medium">{item.school}</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-300 italic leading-relaxed grow">"{item.quote}"</p>
                            <div className="mt-4 flex gap-1">
                                {[1, 2, 3, 4, 5].map(i => <div key={i}
                                                               className="w-2 h-2 rounded-full bg-amber-400"></div>)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}