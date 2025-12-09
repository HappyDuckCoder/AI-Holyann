"use client";
import React from 'react';
import {CheckCircle2} from 'lucide-react';
import FadeInView from '@/components/ui/FadeInView';
import SectionHeading from '@/components/ui/SectionHeading';

import {HIGHLIGHTS} from '../../lib/data';

export default function HighlightsSection() {
    return (
        <section id="diem-noi-bat" className="py-20 bg-slate-50">
            <div className="container mx-auto px-4">
                <SectionHeading subtitle="Tại Sao Chọn Chúng Tôi">Điểm Nổi Bật</SectionHeading>

                <div className="grid md:grid-cols-2 gap-8">
                    {HIGHLIGHTS.map((item, idx) => (
                        <FadeInView key={idx} delay={idx * 0.1}>
                            <div
                                className="flex gap-5 p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow h-full">
                                <div className="shrink-0">
                                    <CheckCircle2 className="w-8 h-8 text-[var(--brand-cyan)]"/>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        </FadeInView>
                    ))}
                </div>
            </div>
        </section>
    );
}