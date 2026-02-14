"use client";

import React from "react";
import {
    X,
    Star,
    Award,
    BookOpen,
    FileText,
    Clock,
    GraduationCap,
    Sparkles,
    ChevronRight,
    Target,
    PenTool,
    Lightbulb,
} from "lucide-react";
import { Mentor } from "./types";
import { getRoleIcon, getRoleColor } from "./utils";

interface MentorInfoProps {
    mentor: Mentor;
    showMobileInfo: boolean;
    onCloseMobileInfo: () => void;
}

export const MentorInfo: React.FC<MentorInfoProps> = ({
                                                          mentor,
                                                          showMobileInfo,
                                                          onCloseMobileInfo,
                                                      }) => {
    const RoleIcon = getRoleIcon(mentor.roleCode);
    const roleColors = getRoleColor(mentor.roleCode);

    return (
        <div
            className={`w-72 bg-card border-l border-border flex flex-col h-full overflow-hidden ${
                showMobileInfo
                    ? "fixed inset-y-0 right-0 z-50 shadow-2xl"
                    : "hidden lg:flex"
            }`}
        >
            {showMobileInfo && (
                <button
                    onClick={onCloseMobileInfo}
                    className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full lg:hidden text-muted-foreground z-10"
                >
                    <X size={20} />
                </button>
            )}

            <div className="p-4 text-center border-b border-border shrink-0 bg-gradient-to-b from-primary/5 to-transparent">
                <div className="relative inline-block mb-3">
                    <img
                        src={mentor.avatar}
                        alt={mentor.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-background shadow-md mx-auto"
                    />
                    {mentor.isOnline && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background" />
                    )}
                </div>
                <h3 className="text-base font-bold text-foreground mb-1.5">
                    {mentor.name}
                </h3>
                <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${roleColors.bg} ${roleColors.text}`}
                >
                    <RoleIcon size={12} />
                    {mentor.roleCode}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="p-3 border-b border-border">
                    <h4 className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                        <BookOpen size={14} className="text-primary" />
                        Vai trò
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {mentor.description}
                    </p>
                </div>

                <div className="p-3 border-b border-border">
                    <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                        <Award size={14} className="text-amber-500 dark:text-amber-400" />
                        Thành tựu
                    </h4>
                    <ul className="space-y-1.5">
                        {mentor.achievements.slice(0, 3).map((achievement, index) => (
                            <li
                                key={index}
                                className="flex items-start gap-1.5 text-xs text-muted-foreground"
                            >
                                <Star
                                    size={12}
                                    className="text-amber-500 dark:text-amber-400 mt-0.5 shrink-0"
                                />
                                <span className="line-clamp-2">{achievement}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="p-3 border-b border-border">
                    <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-violet-500 dark:text-violet-400" />
                        Thao tác nhanh
                    </h4>
                    <div className="space-y-1.5">
                        <button className="w-full flex items-center justify-between px-3 py-2 bg-muted/50 hover:bg-muted rounded-lg transition-colors group border border-border">
                            <span className="flex items-center gap-1.5 text-xs text-foreground">
                                <FileText size={14} className="text-primary" />
                                File đã gửi
                            </span>
                            <ChevronRight size={14} className="text-muted-foreground group-hover:text-foreground" />
                        </button>
                        <button className="w-full flex items-center justify-between px-3 py-2 bg-muted/50 hover:bg-muted rounded-lg transition-colors group border border-border">
                            <span className="flex items-center gap-1.5 text-xs text-foreground">
                                <Clock size={14} className="text-amber-500 dark:text-amber-400" />
                                Đặt lịch hẹn
                            </span>
                            <ChevronRight size={14} className="text-muted-foreground group-hover:text-foreground" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-3 border-t border-border shrink-0 bg-muted/20">
                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2 tracking-wider">
                    Vai trò
                </h4>
                <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 p-1.5 bg-primary/10 rounded-lg border border-primary/20">
                        <Target size={12} className="text-primary" />
                        <span className="font-semibold text-primary">AS</span>
                        <span className="text-muted-foreground text-[10px]">- Chiến lược</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-1.5 bg-violet-500/10 rounded-lg border border-violet-500/20">
                        <PenTool size={12} className="text-violet-600 dark:text-violet-400" />
                        <span className="font-semibold text-violet-700 dark:text-violet-300">ACS</span>
                        <span className="text-violet-600/80 dark:text-violet-400/80 text-[10px]">- Biên tập</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <Lightbulb size={12} className="text-emerald-600 dark:text-emerald-400" />
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300">ARD</span>
                        <span className="text-emerald-600/80 dark:text-emerald-400/80 text-[10px]">- Phát triển</span>
                    </div>
                </div>
            </div>
        </div>
    );
};