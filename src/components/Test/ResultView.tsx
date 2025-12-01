import React from 'react';
import {RotateCcw, Sparkles, BookOpen, Briefcase, Target, TrendingUp} from 'lucide-react';
import {TestResult, MajorRecommendation} from '../types';
import ResultChart from './ResultChart';

interface ResultViewProps {
    result: TestResult | null;
    recommendations: MajorRecommendation[];
    loadingRecommendations: boolean;
    onBackToDashboard: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({
                                                   result,
                                                   recommendations,
                                                   loadingRecommendations,
                                                   onBackToDashboard
                                               }) => {
    if (!result) return null;

    return (
        <div className="space-y-8 animate-fade-in">
            <button
                onClick={onBackToDashboard}
                className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium"
            >
                <RotateCcw size={16}/> Quay về trang chủ
            </button>

            {/* Result Header */}
            <div
                className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Kết quả: {result.rawLabel}</h2>
                    <p className="text-blue-100 max-w-2xl text-lg leading-relaxed">{result.description}</p>
                </div>
                <div
                    className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none bg-white skew-x-12 transform translate-x-20"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Chart Section Component */}
                <div className="lg:col-span-1">
                    <ResultChart result={result}/>
                </div>

                {/* AI Recommendations Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600"/>
                            Đề xuất ngành học phù hợp (AI)
                        </h3>
                    </div>

                    {loadingRecommendations ? (
                        <div
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
                            <div
                                className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-600 font-medium">AI đang phân tích tính cách của bạn...</p>
                            <p className="text-sm text-gray-400 mt-2">Đang tìm kiếm ngành học phù hợp nhất...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {recommendations.map((rec, idx) => (
                                <div key={idx}
                                     className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all hover:border-purple-200">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div
                                                    className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                                                    <BookOpen className="w-5 h-5 text-white"/>
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-bold text-gray-900">{rec.name}</h4>
                                                    <span className="text-sm text-gray-500">{rec.category}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="text-2xl font-bold text-purple-600">{rec.matchPercentage}%</span>
                                                <TrendingUp className="w-5 h-5 text-purple-600"/>
                                            </div>
                                            <span
                                                className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                                {rec.matchPercentage >= 85 ? 'Rất phù hợp' : rec.matchPercentage >= 70 ? 'Phù hợp' : 'Có tiềm năng'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Match Reason */}
                                    <div
                                        className="mb-4 bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-100">
                                        <p className="text-sm text-gray-800 leading-relaxed">
                                            <span
                                                className="font-semibold text-purple-700">Tại sao phù hợp:</span> {rec.matchReason}
                                        </p>
                                    </div>

                                    {/* Career Paths */}
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Briefcase className="w-4 h-4 text-blue-600"/>
                                            <span
                                                className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Con đường sự nghiệp</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {rec.careerPaths.map((career, cIdx) => (
                                                <span key={cIdx}
                                                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
                                                    {career}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Required Skills */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Target className="w-4 h-4 text-green-600"/>
                                            <span
                                                className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Kỹ năng cần có</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {rec.requiredSkills.map((skill, sIdx) => (
                                                <span key={sIdx}
                                                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                                                    • {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {recommendations.length === 0 && !loadingRecommendations && (
                                <div
                                    className="p-8 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                                    <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
                                    <p className="font-medium">Không tìm thấy đề xuất phù hợp.</p>
                                    <p className="text-sm mt-1">Vui lòng thử lại hoặc làm test khác để có kết quả tốt
                                        hơn.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultView;