import React from 'react';
import SectionHeading from '@/components/ui/SectionHeading';

export default function AchievementsSection() {
    return (
        <section id="thanh-tich" className="py-20 bg-slate-900 text-white overflow-hidden">
            <div className="container mx-auto px-4 text-center">
                <SectionHeading subtitle="Hall of Fame">Dấu Ấn Thành Công</SectionHeading>
                <p className="text-slate-400 mb-12 max-w-2xl mx-auto">
                    [cite_start]Học viên của chúng tôi đã chinh phục các học bổng và trường đại học danh giá trên toàn
                    cầu. [cite: 56-106]
                </p>

                <div
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 opacity-80 text-sm md:text-base font-semibold">
                    {/* Hoa Kỳ */}
                    <div className="flex flex-col gap-4">
                        <span
                            className="text-blue-400 font-bold uppercase text-xs mb-2 tracking-widest border-b border-blue-900/50 pb-2">Hoa Kỳ</span>
                        <p>Purdue Fort Wayne</p>
                        <p>Sewanee</p>
                        <p>DePauw University</p>
                        <p>The College of Wooster</p>
                    </div>
                    {/* Châu Á */}
                    <div className="flex flex-col gap-4">
                        <span
                            className="text-blue-400 font-bold uppercase text-xs mb-2 tracking-widest border-b border-blue-900/50 pb-2">Châu Á</span>
                        <p>PolyU (HongKong)</p>
                        <p>Yonsei (Hàn Quốc)</p>
                        <p>HKUST</p>
                        <p>National Tsing Hua</p>
                    </div>
                    {/* Việt Nam */}
                    <div className="flex flex-col gap-4">
                        <span
                            className="text-blue-400 font-bold uppercase text-xs mb-2 tracking-widest border-b border-blue-900/50 pb-2">Việt Nam</span>
                        <p>VinUniversity</p>
                        <p>Fulbright University</p>
                        <p>RMIT</p>
                        <p>British University (BUV)</p>
                    </div>
                    {/* Châu Âu */}
                    <div className="flex flex-col gap-4">
                        <span
                            className="text-blue-400 font-bold uppercase text-xs mb-2 tracking-widest border-b border-blue-900/50 pb-2">Châu Âu/Khác</span>
                        <p>Univ. din București</p>
                        <p>Bocconi University</p>
                        <p>University of Greenwich</p>
                        <p>Monash University</p>
                    </div>
                </div>
            </div>
        </section>
    );
}