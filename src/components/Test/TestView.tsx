import React, {useState} from 'react';
import {RotateCcw} from 'lucide-react';
import {Question, TestType} from '../types';
import {TEST_DESCRIPTIONS} from '@/constants';

interface TestViewProps {
    testType: TestType;
    questions: Question[];
    onBack: () => void;
    onComplete: (answers: Record<number, string | number>) => void;
}

const ProgressBar: React.FC<{ current: number; total: number }> = ({current, total}) => {
    const percentage = Math.round(((current + 1) / total) * 100);
    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{width: `${percentage}%`}}
            ></div>
        </div>
    );
};

const TestView: React.FC<TestViewProps> = ({testType, questions, onBack, onComplete}) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string | number>>({});

    const handleAnswer = (value: string | number) => {
        const question = questions[currentQuestionIndex];
        const newAnswers = {...answers, [question.id]: value};
        setAnswers(newAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 250);
        } else {
            onComplete(newAnswers);
        }
    };

    const question = questions[currentQuestionIndex];
    if (!question) return null;

    return (
        <div className="max-w-3xl mx-auto pt-8">
            <button
                onClick={onBack}
                className="text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-2 text-sm font-medium"
            >
                <RotateCcw size={16}/> Quay lại
            </button>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12">
                <div className="flex justify-between items-center mb-4 text-sm text-gray-500 font-medium">
                    <span>{TEST_DESCRIPTIONS[testType].title}</span>
                    <span>Câu {currentQuestionIndex + 1} / {questions.length}</span>
                </div>

                <ProgressBar current={currentQuestionIndex} total={questions.length}/>

                <h3 className="text-2xl font-bold text-gray-900 mb-8 leading-snug">
                    {question.text}
                </h3>

                <div className="space-y-4">
                    {testType === 'MBTI' && (
                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => handleAnswer('A')}
                                className="p-6 text-left border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                            >
                                <span className="font-bold text-blue-600 mr-2 group-hover:underline">A.</span>
                                {question.optionA}
                            </button>
                            <button
                                onClick={() => handleAnswer('B')}
                                className="p-6 text-left border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                            >
                                <span className="font-bold text-blue-600 mr-2 group-hover:underline">B.</span>
                                {question.optionB}
                            </button>
                        </div>
                    )}

                    {(testType === 'GRIT' || testType === 'RIASEC') && (
                        <div className="space-y-6">
                            <div className="flex justify-between text-xs md:text-sm font-medium text-gray-500 px-2">
                                <span>Không giống tôi chút nào <br/>(Dislike)</span>
                                <span className="text-right">Rất giống tôi <br/>(Enjoy)</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                {[1, 2, 3, 4, 5].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => handleAnswer(val)}
                                        className="w-full aspect-square md:aspect-auto md:h-14 rounded-lg bg-gray-50 border border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all font-bold text-lg text-gray-700 shadow-sm"
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestView;