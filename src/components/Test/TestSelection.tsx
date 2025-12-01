import React from 'react';
import {Sparkles} from 'lucide-react';
import TestCard from './TestCard';
import {TestType} from '../types';
import {TEST_DESCRIPTIONS} from '@/constants';

interface TestSelectionProps {
    onStartTest: (type: TestType) => void;
}

const TestSelection: React.FC<TestSelectionProps> = ({onStartTest}) => {
    return (
        <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500"/>
                Khám phá bản thân
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TestCard
                    title={TEST_DESCRIPTIONS.MBTI.title}
                    description={TEST_DESCRIPTIONS.MBTI.desc}
                    colorClass={TEST_DESCRIPTIONS.MBTI.color}
                    iconType="MBTI"
                    onClick={() => onStartTest('MBTI')}
                />
                <TestCard
                    title={TEST_DESCRIPTIONS.GRIT.title}
                    description={TEST_DESCRIPTIONS.GRIT.desc}
                    colorClass={TEST_DESCRIPTIONS.GRIT.color}
                    iconType="GRIT"
                    onClick={() => onStartTest('GRIT')}
                />
                <TestCard
                    title={TEST_DESCRIPTIONS.RIASEC.title}
                    description={TEST_DESCRIPTIONS.RIASEC.desc}
                    colorClass={TEST_DESCRIPTIONS.RIASEC.color}
                    iconType="RIASEC"
                    onClick={() => onStartTest('RIASEC')}
                />
            </div>
        </div>
    );
};

export default TestSelection;
