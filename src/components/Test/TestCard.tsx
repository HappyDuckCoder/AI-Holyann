import React from 'react';
import {ArrowRight, Brain, Briefcase, Activity} from 'lucide-react';

interface TestCardProps {
    title: string;
    description: string;
    colorClass: string;
    iconType: 'MBTI' | 'RIASEC' | 'GRIT';
    onClick: () => void;
}

const TestCard: React.FC<TestCardProps> = ({title, description, colorClass, iconType, onClick}) => {
    const getIcon = () => {
        switch (iconType) {
            case 'MBTI':
                return <Brain className="w-6 h-6 text-white"/>;
            case 'RIASEC':
                return <Briefcase className="w-6 h-6 text-white"/>;
            case 'GRIT':
                return <Activity className="w-6 h-6 text-white"/>;
            default:
                return <Brain className="w-6 h-6 text-white"/>;
        }
    };

    return (
        <div
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full hover:shadow-md transition-shadow duration-300">
            <div className={`w-12 h-12 rounded-lg ${colorClass} flex items-center justify-center mb-4`}>
                {getIcon()}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm mb-6 flex-grow leading-relaxed">
                {description}
            </p>
            <button
                onClick={onClick}
                className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg border border-gray-200 transition-colors flex items-center justify-center gap-2 group"
            >
                Làm bài test
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
            </button>
        </div>
    );
};

export default TestCard;
