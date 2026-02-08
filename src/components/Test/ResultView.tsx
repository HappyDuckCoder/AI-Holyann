import React from 'react';
import { RotateCcw, Briefcase, Brain, Activity } from 'lucide-react';
import {TestResult, MajorRecommendation, TestType} from '../types';
import ResultChart from './ResultChart';
import {TEST_DESCRIPTIONS} from '@/constants';

interface ResultViewProps {
    result: TestResult | null;
    recommendations: MajorRecommendation[];
    loadingRecommendations: boolean;
    onBackToDashboard: () => void;
    // New props for test progress
    remainingTests?: TestType[];
    onStartNextTest?: (type: TestType) => void;
    allTestsCompleted?: boolean;
    onViewAllRecommendations?: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({
                                                   result,
                                                   recommendations,
                                                   loadingRecommendations,
                                                   onBackToDashboard,
                                                   remainingTests = [],
                                                   onStartNextTest,
                                                   allTestsCompleted = false,
                                                   onViewAllRecommendations
                                               }) => {
    if (!result) return null;

    const getTestIcon = (type: TestType) => {
        switch (type) {
            case 'MBTI':
                return <Brain className="w-5 h-5"/>;
            case 'GRIT':
                return <Activity className="w-5 h-5"/>;
            case 'RIASEC':
                return <Briefcase className="w-5 h-5"/>;
        }
    };

    const getTestColor = (type: TestType) => {
        switch (type) {
            case 'MBTI':
                return 'bg-blue-500 hover:bg-blue-600';
            case 'GRIT':
                return 'bg-purple-500 hover:bg-purple-600';
            case 'RIASEC':
                return 'bg-emerald-500 hover:bg-emerald-600';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <button
                type="button"
                onClick={onBackToDashboard}
                className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors"
            >
                <RotateCcw size={16} /> Quay về trang chủ
            </button>

            <div className="w-full rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
                <ResultChart result={result} />
            </div>
        </div>
    );
};

export default ResultView;