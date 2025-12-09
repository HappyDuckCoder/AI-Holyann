import React from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, BarChart, Bar,
    XAxis, YAxis, CartesianGrid
} from 'recharts';
import {TestResult} from '../types';

interface ResultChartProps {
    result: TestResult;
}

const ResultChart: React.FC<ResultChartProps> = ({result}) => {
    // --- Data Preparation Logic ---

    // 1. RIASEC Data
    const riasecData = result.type === 'RIASEC'
        ? Object.entries(result.scores).map(([key, value]) => ({subject: key, A: value, fullMark: 25}))
        : [];

    // 2. MBTI Data
    const mbtiChartData = result.type === 'MBTI' ? [
        {name: 'Energy', A: result.scores.E, B: result.scores.I, labelA: 'Extraversion', labelB: 'Introversion'},
        {name: 'Mind', A: result.scores.S, B: result.scores.N, labelA: 'Sensing', labelB: 'Intuition'},
        {name: 'Nature', A: result.scores.T, B: result.scores.F, labelA: 'Thinking', labelB: 'Feeling'},
        {name: 'Tactics', A: result.scores.J, B: result.scores.P, labelA: 'Judging', labelB: 'Prospecting'},
    ] : [];

    // 3. Grit Data
    const gritScore = result.type === 'GRIT' ? result.scores.Grit : 0;
    const gritChartData = [
        {name: 'Score', value: gritScore},
        {name: 'Remaining', value: parseFloat((5 - gritScore).toFixed(2))}
    ];

    // Grit Breakdown Data (Consistency vs Perseverance)
    const gritBreakdownData = result.type === 'GRIT' ? [
        {name: 'Bền bỉ nỗ lực', score: result.scores.Perseverance || 0, fill: 'var(--grit-perseverance)'},
        {name: 'Duy trì hứng thú', score: result.scores.Consistency || 0, fill: 'var(--grit-consistency)'},
    ] : [];

    const GRIT_COLORS = ['var(--grit-strong)', 'var(--muted-light)']; // Purple and Gray

    return (
        <div
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center min-h-[400px]">
            <h3 className="text-lg font-bold text-gray-800 mb-6 self-start w-full border-b border-gray-100 pb-2">
                Biểu đồ phân tích
            </h3>

            {/* --- RIASEC RADAR CHART --- */}
            {result.type === 'RIASEC' && (
                <div className="w-full h-[300px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={riasecData}>
                            <PolarGrid/>
                            <PolarAngleAxis dataKey="subject" tick={{fill: 'var(--tick-gray)', fontSize: 12}}/>
                            <PolarRadiusAxis angle={30} domain={[0, 25]} tick={false}/>
                            <Radar name="My Interest" dataKey="A" stroke="var(--stroke-blue)" fill="var(--tw-blue-500)"
                                   fillOpacity={0.6}/>
                            <Tooltip/>
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* --- GRIT CHARTS --- */}
            {result.type === 'GRIT' && (
                <div className="flex flex-col w-full h-full gap-8">
                    {/* Gauge Chart (Total) */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-full h-[180px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={gritChartData}
                                        cx="50%"
                                        cy="100%"
                                        startAngle={180}
                                        endAngle={0}
                                        innerRadius="75%"
                                        outerRadius="100%"
                                        paddingAngle={0}
                                        dataKey="value"
                                    >
                                        {gritChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={GRIT_COLORS[index % GRIT_COLORS.length]}/>
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div
                                className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end h-full pb-2 pointer-events-none">
                                <span className="text-4xl font-black text-purple-600">{gritScore}</span>
                                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Tổng điểm / 5.0</span>
                            </div>
                        </div>
                    </div>

                    {/* Bar Chart (Breakdown) */}
                    <div className="w-full h-[200px]">
                        <h4 className="text-sm font-semibold text-gray-600 mb-2 text-center">Chi tiết thành phần</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={gritBreakdownData}
                                layout="vertical"
                                margin={{top: 5, right: 30, left: 40, bottom: 5}}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false}/>
                                <XAxis type="number" domain={[0, 5]} hide/>
                                <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 11}}/>
                                <Tooltip cursor={{fill: 'transparent'}}/>
                                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                                    {gritBreakdownData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill}/>
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                        <p><span className="font-bold text-purple-600">Bền bỉ nỗ lực:</span> Khả năng làm việc chăm chỉ
                            trước thử thách.</p>
                        <p className="mt-1"><span className="font-bold text-pink-500">Duy trì hứng thú:</span> Khả năng
                            giữ vững mục tiêu qua thời gian dài.</p>
                    </div>
                </div>
            )}

            {/* --- MBTI STACKED BAR CHART --- */}
            {result.type === 'MBTI' && (
                <div className="w-full h-[320px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={mbtiChartData}
                            margin={{top: 5, right: 30, left: 20, bottom: 5}}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                            <XAxis type="number" domain={[0, 100]} hide/>
                            <YAxis dataKey="name" type="category" width={50} tick={{fontSize: 12, fontWeight: 500}}/>
                            <Tooltip
                                cursor={{fill: 'transparent'}}
                                content={({active, payload}) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div
                                                className="bg-white p-2 border border-gray-100 shadow-lg rounded text-xs z-50">
                                                <p className="text-blue-600 font-bold">{data.labelA}: {data.A}%</p>
                                                <p className="text-gray-500 font-bold">{data.labelB}: {data.B}%</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="A" stackId="a" fill="var(--tw-blue-500)" radius={[4, 0, 0, 4]}/>
                            <Bar dataKey="B" stackId="a" fill="var(--muted-light)" radius={[0, 4, 4, 0]}/>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                            Trait A
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
                            Trait B
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultChart;
