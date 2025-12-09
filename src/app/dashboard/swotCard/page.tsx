'use client';

import React, {useState} from 'react';
import AuthHeader from '@/components/dashboard/AuthHeader';
import {useRouter} from 'next/navigation';
import {SwotData, StudentProfile} from '@/components/types';
import {SwotCard} from '@/components/dashboard/Profile/SwotCard';
import {MOCK_STUDENT_PROFILE} from '@/service/geminiService';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import {
    ShieldCheck,
    AlertOctagon,
    Zap,
    Target,
    Sparkles,
    Loader2,
    ArrowLeft,
    GraduationCap,
    Globe,
    Trophy,
    BrainCircuit
} from 'lucide-react';

export default function SwotCardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [swotData, setSwotData] = useState<SwotData | null>(null);
    const [analyzed, setAnalyzed] = useState(false);

    const handleAnalysis = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/swot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(MOCK_STUDENT_PROFILE),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to generate analysis');
            }

            const data: SwotData = await response.json();
            setSwotData(data);
            setAnalyzed(true);
        } catch (error) {
            console.error("Analysis failed", error);
            alert(`Có lỗi xảy ra: ${error instanceof Error ? error.message : 'Vui lòng kiểm tra API Key.'}`);
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data format
    const chartData = swotData?.scores ? [
        {subject: 'Học thuật', A: swotData.scores.academic || 0, fullMark: 100},
        {subject: 'Ngoại ngữ', A: swotData.scores.language || 0, fullMark: 100},
        {subject: 'Kỹ năng', A: swotData.scores.skills || 0, fullMark: 100},
        {subject: 'Lãnh đạo', A: swotData.scores.leadership || 0, fullMark: 100},
        {subject: 'Hoạt động', A: swotData.scores.extracurricular || 0, fullMark: 100},
    ] : [
        {subject: 'Học thuật', A: 80, fullMark: 100},
        {subject: 'Ngoại ngữ', A: 65, fullMark: 100},
        {subject: 'Kỹ năng', A: 70, fullMark: 100},
        {subject: 'Lãnh đạo', A: 50, fullMark: 100},
        {subject: 'Hoạt động', A: 60, fullMark: 100},
    ];

    return (
        <div className="min-h-screen flex flex-col font-sans bg-white dark:bg-slate-950">
            <AuthHeader/>

            <main className="flex-grow p-6 max-w-7xl mx-auto w-full space-y-6">

                {/* Navigation & Title */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-sm text-gray-500 hover:text-[var(--brand-deep)] mb-2 transition-colors"
                        >
                            <ArrowLeft size={16} className="mr-1"/> Quay lại hồ sơ
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Phân tích SWOT & Định
                            hướng</h2>
                    </div>

                    {!analyzed && !loading && (
                        <button
                            onClick={handleAnalysis}
                            className="bg-[var(--brand-deep)] hover:bg-[var(--brand-deep-darker)] text-white px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-medium"
                        >
                            <Sparkles className="w-5 h-5"/> Tạo phân tích AI
                        </button>
                    )}
                </div>

                {/* Profile Summary Card - Context for the Analysis */}
                <div
                    className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-center md:items-start">
                    <div
                        className="w-20 h-20 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 border-2 border-white dark:border-slate-800 shadow-sm">
                        {/* Placeholder Avatar */}
                        <img src="https://api.dicebear.com/9.x/notionists/svg?seed=Felix" alt="Avatar"
                             className="w-full h-full object-cover"/>
                    </div>
                    <div className="flex-grow text-center md:text-left">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{MOCK_STUDENT_PROFILE.name}</h3>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                            <span
                                className="px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-semibold rounded-full flex items-center gap-1">
                                <GraduationCap size={12}/> GPA: {MOCK_STUDENT_PROFILE.gpa}
                            </span>
                            <span
                                className="px-3 py-1 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-200 text-xs font-semibold rounded-full flex items-center gap-1">
                                <Globe size={12}/> {MOCK_STUDENT_PROFILE.englishLevel}
                            </span>
                            <span
                                className="px-3 py-1 bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-200 text-xs font-semibold rounded-full flex items-center gap-1">
                                <Trophy size={12}/> {MOCK_STUDENT_PROFILE.targetMajor}
                            </span>
                        </div>
                    </div>
                    {analyzed && swotData && (
                        <div className="text-right hidden md:block">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Điểm đánh
                                giá chung</p>
                            <div className="text-3xl font-bold text-[var(--brand-deep)]">
                                {swotData?.scores ? Math.round(((Object.values(swotData.scores) as number[]).reduce((a, b) => a + b, 0)) / 5) : '--'}
                                <span className="text-lg text-gray-400 dark:text-gray-500 font-normal">/100</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div
                        className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-12 text-center animate-pulse">
                        <Loader2 className="w-12 h-12 text-[var(--brand-deep)] animate-spin mx-auto mb-4"/>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Đang phân tích hồ sơ...</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Hệ thống đang tổng hợp dữ liệu và so
                            sánh với tiêu chuẩn du học.</p>
                    </div>
                )}

                {/* Results Dashboard */}
                {analyzed && swotData && (
                    <div className="space-y-6 animate-in fade-in duration-700">

                        {/* Top Row: Chart + Strategy */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Radar Chart */}
                            <div
                                className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-4 lg:col-span-1 flex flex-col items-center">
                                <h4 className="w-full font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-3">
                                    <BrainCircuit size={18} className="text-[#0f6093]"/> Biểu đồ năng lực
                                </h4>
                                <div className="w-full h-[300px] -ml-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                            <PolarGrid stroke="#E2E8F0"/>
                                            <PolarAngleAxis dataKey="subject"
                                                            tick={{fill: '#64748B', fontSize: 12, fontWeight: 500}}/>
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false}
                                                             axisLine={false}/>
                                            <Radar
                                                name="Học sinh"
                                                dataKey="A"
                                                stroke="#0f6093"
                                                fill="#0f6093"
                                                fillOpacity={0.5}
                                            />
                                            <Tooltip/>
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Strategic Advice */}
                            <div
                                className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 lg:col-span-2 relative overflow-hidden">
                                <div
                                    className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 opacity-5 rounded-bl-full pointer-events-none"></div>

                                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                                    <span
                                        className="p-1.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 rounded-lg">
                                        <Sparkles size={18}/>
                                    </span>
                                    Chiến lược trọng tâm
                                </h4>

                                <div className="grid gap-4">
                                    {swotData.strategicAdvice.map((item, idx) => (
                                        <div key={idx}
                                             className="flex gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-blue-100 dark:hover:border-blue-800 transition-colors">
                                            <div
                                                className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0f6093] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h5>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* SWOT Matrix Grid */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                Chi tiết Ma trận SWOT
                                <span
                                    className="text-xs font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-slate-700">Được tạo bởi AI</span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Strengths */}
                                <SwotCard
                                    title="Strengths (Điểm mạnh)"
                                    items={swotData.strengths}
                                    icon={<ShieldCheck size={20}/>}
                                    variant="success"
                                />

                                {/* Weaknesses */}
                                <SwotCard
                                    title="Weaknesses (Điểm yếu)"
                                    items={swotData.weaknesses}
                                    icon={<AlertOctagon size={20}/>}
                                    variant="danger"
                                />

                                {/* Opportunities */}
                                <SwotCard
                                    title="Opportunities (Cơ hội)"
                                    items={swotData.opportunities}
                                    icon={<Zap size={20}/>}
                                    variant="info"
                                />

                                {/* Threats */}
                                <SwotCard
                                    title="Threats (Thách thức)"
                                    items={swotData.threats}
                                    icon={<Target size={20}/>}
                                    variant="warning"
                                />
                            </div>
                        </div>

                        <div className="flex justify-center pt-8 pb-10">
                            <button
                                onClick={handleAnalysis}
                                className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#0f6093] dark:hover:text-[#2b8cc9] flex items-center gap-2 transition-colors"
                            >
                                <Loader2 size={14}/> Làm mới kết quả phân tích
                            </button>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}
