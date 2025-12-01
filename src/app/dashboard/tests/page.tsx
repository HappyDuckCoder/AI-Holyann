'use client';

import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import AuthHeader from '@/components/dashboard/AuthHeader';
import TestSelection from '@/components/Test/TestSelection';
import TestView from '@/components/Test/TestView';
import ResultView from '@/components/Test/ResultView';
import {TestType, Question, TestResult, MajorRecommendation} from '@/components/types';
import {MBTI_QUESTIONS, GRIT_QUESTIONS, RIASEC_QUESTIONS} from '@/constants';
import {getMajorRecommendations} from '@/service/geminiService';

type ViewState = 'selection' | 'test' | 'result';

export default function TestsPage() {
    const router = useRouter();
    const [viewState, setViewState] = useState<ViewState>('selection');
    const [currentTestType, setCurrentTestType] = useState<TestType | null>(null);
    const [testResult, setTestResult] = useState<TestResult | null>(null);
    const [recommendations, setRecommendations] = useState<MajorRecommendation[]>([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);

    const handleStartTest = (type: TestType) => {
        setCurrentTestType(type);
        setViewState('test');
    };

    const getQuestionsForTest = (type: TestType): Question[] => {
        switch (type) {
            case 'MBTI':
                return MBTI_QUESTIONS;
            case 'GRIT':
                return GRIT_QUESTIONS;
            case 'RIASEC':
                return RIASEC_QUESTIONS;
            default:
                return [];
        }
    };

    const calculateMBTIResult = (answers: Record<number, string | number>): TestResult => {
        const scores: Record<string, number> = {E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0};

        MBTI_QUESTIONS.forEach(q => {
            const answer = answers[q.id];
            if (answer === 'A' && q.dimension) {
                scores[q.dimension[0]]++;
            } else if (answer === 'B' && q.dimension) {
                scores[q.dimension[1]]++;
            }
        });

        const type =
            (scores.E > scores.I ? 'E' : 'I') +
            (scores.S > scores.N ? 'S' : 'N') +
            (scores.T > scores.F ? 'T' : 'F') +
            (scores.J > scores.P ? 'J' : 'P');

        // Convert to percentages
        const totalEI = scores.E + scores.I;
        const totalSN = scores.S + scores.N;
        const totalTF = scores.T + scores.F;
        const totalJP = scores.J + scores.P;

        const percentageScores = {
            E: totalEI > 0 ? Math.round((scores.E / totalEI) * 100) : 0,
            I: totalEI > 0 ? Math.round((scores.I / totalEI) * 100) : 0,
            S: totalSN > 0 ? Math.round((scores.S / totalSN) * 100) : 0,
            N: totalSN > 0 ? Math.round((scores.N / totalSN) * 100) : 0,
            T: totalTF > 0 ? Math.round((scores.T / totalTF) * 100) : 0,
            F: totalTF > 0 ? Math.round((scores.F / totalTF) * 100) : 0,
            J: totalJP > 0 ? Math.round((scores.J / totalJP) * 100) : 0,
            P: totalJP > 0 ? Math.round((scores.P / totalJP) * 100) : 0,
        };

        const descriptions: Record<string, string> = {
            'INTJ': 'Kiến trúc sư - Người có tư duy chiến lược, sáng tạo và luôn có kế hoạch cho mọi việc.',
            'INTP': 'Nhà logic học - Người đổi mới, ham học hỏi và luôn tìm kiếm kiến thức mới.',
            'ENTJ': 'Chỉ huy quan - Lãnh đạo táo bạo, giàu trí tưởng tượng và ý chí mạnh mẽ.',
            'ENTP': 'Nhà tranh luận - Người thông minh, tò mò và không thể cưỡng lại trí thách thức.',
            'INFJ': 'Người ủng hộ - Lý tưởng hóa, tầm nhìn xa và đầy cảm hứng.',
            'INFP': 'Người hòa giải - Thi sĩ, tử tế và luôn sẵn sàng giúp đỡ.',
            'ENFJ': 'Người chủ xướng - Lãnh đạo đầy cảm hứng, thu hút và dễ gây ấn tượng.',
            'ENFP': 'Nhà vận động - Người nhiệt tình, sáng tạo và lạc quan.',
            'ISTJ': 'Người trách nhiệm - Thực tế, đáng tin cậy và tỉ mỉ.',
            'ISFJ': 'Người bảo vệ - Tận tâm, ấm áp và luôn sẵn sàng bảo vệ người thân.',
            'ESTJ': 'Người điều hành - Quản lý giỏi, thẳng thắn và truyền thống.',
            'ESFJ': 'Người cung cấp - Quan tâm, hợp tác và luôn muốn giúp đỡ.',
            'ISTP': 'Người khéo léo - Táo bạo, thực tế và thích thử nghiệm.',
            'ISFP': 'Nghệ sĩ - Linh hoạt, dễ chịu và sẵn sàng khám phá.',
            'ESTP': 'Doanh nhân - Năng động, thông minh và sống hết mình.',
            'ESFP': 'Nghệ sĩ biểu diễn - Tự phát, nhiệt tình và vui vẻ.'
        };

        return {
            type: 'MBTI',
            scores: percentageScores,
            rawLabel: type,
            description: descriptions[type] || 'Kết quả MBTI của bạn.'
        };
    };

    const calculateGritResult = (answers: Record<number, string | number>): TestResult => {
        let perseveranceScore = 0;
        let consistencyScore = 0;
        let perseveranceCount = 0;
        let consistencyCount = 0;

        GRIT_QUESTIONS.forEach(q => {
            const answer = Number(answers[q.id]) || 0;
            const score = q.reverseScore ? (6 - answer) : answer;

            // Odd questions = Perseverance, Even = Consistency
            if (q.id % 2 === 1) {
                perseveranceScore += score;
                perseveranceCount++;
            } else {
                consistencyScore += score;
                consistencyCount++;
            }
        });

        const avgPerseverance = perseveranceCount > 0 ? perseveranceScore / perseveranceCount : 0;
        const avgConsistency = consistencyCount > 0 ? consistencyScore / consistencyCount : 0;
        const gritScore = (avgPerseverance + avgConsistency) / 2;

        let label = 'Low Grit';
        let description = 'Bạn cần phát triển thêm sự kiên trì và đam mê với mục tiêu dài hạn.';

        if (gritScore >= 4.0) {
            label = 'High Grit';
            description = 'Bạn có sự kiên trì và đam mê xuất sắc với các mục tiêu dài hạn!';
        } else if (gritScore >= 3.0) {
            label = 'Moderate Grit';
            description = 'Bạn có mức độ kiên trì khá tốt, nhưng vẫn có thể cải thiện thêm.';
        }

        return {
            type: 'GRIT',
            scores: {
                Grit: parseFloat(gritScore.toFixed(2)),
                Perseverance: parseFloat(avgPerseverance.toFixed(2)),
                Consistency: parseFloat(avgConsistency.toFixed(2))
            },
            rawLabel: label,
            description: description
        };
    };

    const calculateRIASECResult = (answers: Record<number, string | number>): TestResult => {
        const scores: Record<string, number> = {R: 0, I: 0, A: 0, S: 0, E: 0, C: 0};

        RIASEC_QUESTIONS.forEach(q => {
            const answer = Number(answers[q.id]) || 0;
            if (q.category) {
                scores[q.category] += answer;
            }
        });

        const sortedCategories = Object.entries(scores)
            .sort(([, a], [, b]) => b - a)
            .map(([cat]) => cat);

        const topCode = sortedCategories.slice(0, 3).join('');

        const descriptions: Record<string, string> = {
            'R': 'Realistic (Thực tế) - Thích làm việc với tay, máy móc, thực hành.',
            'I': 'Investigative (Nghiên cứu) - Thích tư duy, nghiên cứu, khám phá.',
            'A': 'Artistic (Nghệ thuật) - Thích sáng tạo, nghệ thuật, thể hiện bản thân.',
            'S': 'Social (Xã hội) - Thích giúp đỡ, dạy dỗ, chăm sóc người khác.',
            'E': 'Enterprising (Quản lý) - Thích lãnh đạo, thuyết phục, kinh doanh.',
            'C': 'Conventional (Nghiệp vụ) - Thích tổ chức, quản lý dữ liệu, chi tiết.'
        };

        return {
            type: 'RIASEC',
            scores: scores,
            rawLabel: topCode,
            description: `Nhóm ngành nghề phù hợp: ${descriptions[sortedCategories[0]]} ${descriptions[sortedCategories[1]]} ${descriptions[sortedCategories[2]]}`
        };
    };

    const handleTestComplete = async (answers: Record<number, string | number>) => {
        if (!currentTestType) return;

        let result: TestResult;

        switch (currentTestType) {
            case 'MBTI':
                result = calculateMBTIResult(answers);
                break;
            case 'GRIT':
                result = calculateGritResult(answers);
                break;
            case 'RIASEC':
                result = calculateRIASECResult(answers);
                break;
            default:
                return;
        }

        setTestResult(result);
        setViewState('result');

        // Fetch AI major recommendations based purely on personality test
        setLoadingRecommendations(true);
        try {
            const recs = await getMajorRecommendations(result);
            setRecommendations(recs);
        } catch (error) {
            console.error('Failed to fetch major recommendations:', error);
            setRecommendations([]);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    const handleBackToSelection = () => {
        setViewState('selection');
        setCurrentTestType(null);
    };

    const handleBackToDashboard = () => {
        router.push('/dashboard/profile');
    };

    return (
        <>
            <AuthHeader/>
            <main
                className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {viewState === 'selection' && (
                        <TestSelection onStartTest={handleStartTest}/>
                    )}

                    {viewState === 'test' && currentTestType && (
                        <TestView
                            testType={currentTestType}
                            questions={getQuestionsForTest(currentTestType)}
                            onBack={handleBackToSelection}
                            onComplete={handleTestComplete}
                        />
                    )}

                    {viewState === 'result' && (
                        <ResultView
                            result={testResult}
                            recommendations={recommendations}
                            loadingRecommendations={loadingRecommendations}
                            onBackToDashboard={handleBackToDashboard}
                        />
                    )}
                </div>
            </main>
        </>
    );
}

