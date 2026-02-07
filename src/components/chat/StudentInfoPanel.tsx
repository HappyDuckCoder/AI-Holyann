"use client";

import React from "react";
import {
    X,
    User,
    Mail,
    Phone,
    MapPin,
    School,
    GraduationCap,
    BookOpen,
    Target
} from "lucide-react";
import { Mentor } from "./types";

interface StudentInfoPanelProps {
    student: Mentor; // Reusing Mentor type for compatibility, but it contains student data
    showMobileInfo: boolean;
    onCloseMobileInfo: () => void;
}

export const StudentInfoPanel: React.FC<StudentInfoPanelProps> = ({
                                                                      student,
                                                                      showMobileInfo,
                                                                      onCloseMobileInfo,
                                                                  }) => {
    // In a real app, we might fetch detailed student profile here using student.id
    // For now, we display what we have mapped into the 'student' object
    // Note: We might have encoded some data into description or achievements if we reused the interface strictly

    // Fallback/Mock data for demonstration since the chat API might only return basic info
    const mockStudentDetails = {
        email: student.description?.includes('@') ? student.description : "student@example.com",
        grade: "Lớp 12",
        school: "THPT Chuyên Lê Hồng Phong",
        target: "Du học Mỹ",
        phone: "0912***789"
    };

    return (
        <div
            className={`w-72 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 flex flex-col h-full overflow-hidden ${
                showMobileInfo
                    ? "fixed inset-y-0 right-0 z-50 shadow-2xl"
                    : "hidden lg:flex"
            }`}
        >
            {/* Mobile Close Button */}
            {showMobileInfo && (
                <button
                    onClick={onCloseMobileInfo}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full lg:hidden text-gray-600 dark:text-slate-300"
                >
                    <X size={20} />
                </button>
            )}

            {/* Header / Avatar */}
            <div className="p-6 flex flex-col items-center border-b border-gray-100 dark:border-slate-700 text-center">
                <div className="relative mb-4">
                    <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md"
                    />
                    {student.isOnline && (
                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                    )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {student.name}
                </h3>
                <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold">
                    {student.roleTitle || "Học viên"}
                </span>
            </div>

            {/* Info List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Contact Info */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Thông tin liên hệ
                    </h4>

                    <div className="flex items-start gap-3 text-sm">
                        <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Email</p>
                            <p className="text-gray-600 dark:text-slate-300 break-all">{mockStudentDetails.email}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 text-sm">
                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Điện thoại</p>
                            <p className="text-gray-600 dark:text-slate-300">{mockStudentDetails.phone}</p>
                        </div>
                    </div>
                </div>

                {/* Academic Info */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Học vấn & Mục tiêu
                    </h4>

                    <div className="flex items-start gap-3 text-sm">
                        <School className="w-5 h-5 text-purple-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Trường hiện tại</p>
                            <p className="text-gray-600 dark:text-slate-300">{mockStudentDetails.school}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 text-sm">
                        <GraduationCap className="w-5 h-5 text-orange-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Lớp</p>
                            <p className="text-gray-600 dark:text-slate-300">{mockStudentDetails.grade}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 text-sm">
                        <Target className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Mục tiêu</p>
                            <p className="text-gray-600 dark:text-slate-300">{mockStudentDetails.target}</p>
                        </div>
                    </div>
                </div>

                <button className="w-full py-2.5 mt-4 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors text-sm">
                    Xem hồ sơ chi tiết
                </button>
            </div>
        </div>
    );
};
