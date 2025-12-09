import React from 'react';
import {CheckCircle2, Lock, Circle} from 'lucide-react';
import {Stage} from '@/components/types';

interface StageNavigationProps {
    stages: Stage[];
    currentStageId: number;
    onSelectStage: (id: number) => void;
    completedStages: number[];
}

const StageNavigation: React.FC<StageNavigationProps> = ({stages, currentStageId, onSelectStage, completedStages}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit sticky top-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-wide">Lộ trình hồ sơ</h3>
            <div className="space-y-0 relative">
                {/* Vertical Line */}
                <div className="absolute left-3.5 top-2 bottom-6 w-0.5 bg-gray-100 -z-10"></div>
                {stages.map((stage) => {
                    const isActive = stage.id === currentStageId;
                    const isCompleted = completedStages.includes(stage.id);
                    const isLocked = !stage.isUnlocked;
                    let Icon = Circle;
                    let colorClass = "text-gray-300 border-gray-300 bg-white";
                    let textClass: string;
                    if (isCompleted) {
                        Icon = CheckCircle2;
                        colorClass = "text-green-500 border-green-500 bg-green-50";
                        textClass = "text-gray-700 font-medium";
                    } else if (isActive) {
                        Icon = Circle; // Using Dot indicator for active
                        colorClass = "text-blue-600 border-blue-600 bg-blue-50 ring-4 ring-blue-50";
                        textClass = "text-blue-700 font-bold";
                    } else if (isLocked) {
                        Icon = Lock;
                        colorClass = "text-gray-400 border-gray-200 bg-gray-50";
                        textClass = "text-gray-400";
                    } else {
                        // Unlocked but not active or completed (rare case in this linear flow but good to handle)
                        textClass = "text-gray-600 hover:text-blue-600";
                    }
                    return (
                        <div
                            key={stage.id}
                            className={`flex items-start gap-4 pb-8 last:pb-0 group ${!isLocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                            onClick={() => !isLocked && onSelectStage(stage.id)}
                        >
                            <div
                                className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${colorClass} transition-colors`}>
                                {isActive && !isCompleted ? (
                                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                                ) : (
                                    <Icon size={isLocked ? 14 : 16}/>
                                )}
                            </div>
                            <div className="pt-1">
                                <h4 className={`text-sm ${textClass} transition-colors`}>
                                    GIAI ĐOẠN {stage.id}
                                </h4>
                                <p className={`text-base ${isActive ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium'}`}>
                                    {stage.name}
                                </p>
                                {isActive && (
                                    <p className="text-xs text-gray-500 mt-1 max-w-[200px] line-clamp-2">
                                        {stage.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
export default StageNavigation;