"use client";

import React from "react";
import {
  X,
  Star,
  Award,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  Target,
  PenTool,
  Lightbulb,
  User,
} from "lucide-react";
import { Mentor } from "./types";
import { getRoleIcon, getRoleColor } from "./utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ChatInfoPanelProps {
  mentor: Mentor;
  showMobile?: boolean;
  onCloseMobile?: () => void;
}

export const ChatInfoPanel: React.FC<ChatInfoPanelProps> = ({
  mentor,
  showMobile = false,
  onCloseMobile,
}) => {
  const RoleIcon = getRoleIcon(mentor.roleCode);
  const roleColors = getRoleColor(mentor.roleCode);

  return (
    <div
      className={`w-full md:w-80 lg:w-96 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 flex flex-col h-full
        fixed md:relative inset-y-0 right-0 z-50 md:z-auto transform transition-transform duration-300 ease-in-out
        ${showMobile ? "translate-x-0" : "translate-x-full"} md:translate-x-0 shadow-2xl md:shadow-none`}
    >
      {/* Mobile Close Button */}
      {showMobile && onCloseMobile && (
        <button
          onClick={onCloseMobile}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full md:hidden text-gray-600 dark:text-slate-300 z-10"
          aria-label="Đóng"
        >
          <X size={20} />
        </button>
      )}

      {/* Profile Section */}
      <div className="p-6 text-center border-b border-gray-200 dark:border-slate-800 bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-900 dark:to-slate-900">
        <div className="relative inline-block mb-4">
          <Avatar className="w-20 h-20 ring-4 ring-white dark:ring-slate-900 shadow-lg">
            <AvatarImage src={mentor.avatar} alt={mentor.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-sky-500 text-white text-xl font-bold">
              {mentor.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          {mentor.isOnline && (
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white dark:border-slate-900" />
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {mentor.name}
        </h3>

        <Badge 
          variant="secondary"
          className={`${roleColors.bg} ${roleColors.text} dark:bg-slate-800 dark:text-slate-300 
            border-0 font-semibold text-sm px-3 py-1 h-auto`}
        >
          <RoleIcon size={14} className="mr-1.5" />
          {mentor.roleTitle}
        </Badge>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-5 space-y-6">
          {/* Role Description */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <User size={14} className="text-blue-600 dark:text-blue-400" />
              Vai trò & Trách nhiệm
            </h4>
            <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
              {mentor.description}
            </p>
          </div>

          <Separator className="dark:bg-slate-800" />

          {/* Achievements */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award size={14} className="text-yellow-500 dark:text-yellow-400" />
              Thành tựu nổi bật
            </h4>
            <ul className="space-y-2.5">
              {mentor.achievements.map((achievement, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-slate-300"
                >
                  <Star
                    size={16}
                    className="text-yellow-500 dark:text-yellow-400 mt-0.5 shrink-0"
                    fill="currentColor"
                  />
                  <span className="leading-relaxed">{achievement}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator className="dark:bg-slate-800" />

          {/* Quick Actions */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles size={14} className="text-purple-500 dark:text-purple-400" />
              Thao tác nhanh
            </h4>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-between hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 h-auto py-3 px-4"
              >
                <span className="flex items-center gap-2.5 text-sm">
                  <FileText size={16} className="text-blue-500 dark:text-blue-400" />
                  Xem file đã gửi
                </span>
                <ChevronRight size={16} className="text-gray-400 dark:text-slate-500" />
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-between hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 h-auto py-3 px-4"
              >
                <span className="flex items-center gap-2.5 text-sm">
                  <Clock size={16} className="text-orange-500 dark:text-orange-400" />
                  Đặt lịch hẹn
                </span>
                <ChevronRight size={16} className="text-gray-400 dark:text-slate-500" />
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-between hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 h-auto py-3 px-4"
              >
                <span className="flex items-center gap-2.5 text-sm">
                  <User size={16} className="text-green-500 dark:text-green-400" />
                  Xem hồ sơ Mentor
                </span>
                <ChevronRight size={16} className="text-gray-400 dark:text-slate-500" />
              </Button>
            </div>
          </div>

          <Separator className="dark:bg-slate-800" />

          {/* Role Legend */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Giải thích vai trò
            </h4>
            <div className="space-y-2">
              {/* AS - Admission Strategist */}
              <div className="flex items-start gap-2.5 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900/50">
                <Target size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-blue-700 dark:text-blue-300 text-sm">AS</span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">Chiến lược gia</span>
                  </div>
                  <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                    Lên kế hoạch tổng thể, chọn trường và ngành
                  </p>
                </div>
              </div>

              {/* ACS - Application Content Specialist */}
              <div className="flex items-start gap-2.5 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-100 dark:border-purple-900/50">
                <PenTool size={16} className="text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-purple-700 dark:text-purple-300 text-sm">ACS</span>
                    <span className="text-xs text-purple-600 dark:text-purple-400">Biên tập luận</span>
                  </div>
                  <p className="text-xs text-purple-600/80 dark:text-purple-400/80">
                    Hướng dẫn viết luận và biên tập nội dung
                  </p>
                </div>
              </div>

              {/* ARD - Application Research & Development */}
              <div className="flex items-start gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                <Lightbulb size={16} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">ARD</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">Phát triển Profile</span>
                  </div>
                  <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
                    Xây dựng hoạt động ngoại khóa và dự án
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
