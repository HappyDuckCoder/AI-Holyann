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
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6 h-fit sticky top-6">
            <h3 className="text-lg font-bold text-foreground mb-6 uppercase tracking-wide">Lộ trình hồ sơ</h3>
            <div className="space-y-0 relative">
                <div className="absolute left-3.5 top-2 bottom-6 w-0.5 bg-border -z-10"></div>
                {stages.map((stage) => {
                    const isActive = stage.id === currentStageId;
                    const isCompleted = completedStages.includes(stage.id);
                    const isLocked = !stage.isUnlocked;
                    let Icon = Circle;
                    let colorClass = "text-muted-foreground border-border bg-card";
                    let textClass: string;
                    if (isCompleted) {
                        Icon = CheckCircle2;
                        colorClass = "text-primary border-primary bg-primary/10";
                        textClass = "text-foreground font-medium";
                    } else if (isActive) {
                        Icon = Circle;
                        colorClass = "text-primary border-primary bg-primary/10 ring-4 ring-primary/10";
                        textClass = "text-primary font-bold";
                    } else if (isLocked) {
                        Icon = Lock;
                        colorClass = "text-muted-foreground border-border bg-muted/30";
                        textClass = "text-muted-foreground";
                    } else {
                        textClass = "text-muted-foreground hover:text-primary";
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
                                    <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                                ) : (
                                    <Icon size={isLocked ? 14 : 16}/>
                                )}
                            </div>
                            <div className="pt-1">
                                <h4 className={`text-sm ${textClass} transition-colors`}>
                                    GIAI ĐOẠN {stage.id}
                                </h4>
                                <p className={`text-base ${isActive ? 'text-foreground font-bold' : 'text-muted-foreground font-medium'}`}>
                                    {stage.name}
                                </p>
                                {isActive && (
                                    <p className="text-xs text-muted-foreground mt-1 max-w-[200px] line-clamp-2">
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