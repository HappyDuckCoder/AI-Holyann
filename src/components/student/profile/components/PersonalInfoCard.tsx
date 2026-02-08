"use client";

import React, { useState } from "react";
import { Mail, Phone, Calendar, MapPin } from "lucide-react";
import { StudentProfile } from "../../../types";
import { StatusBadge } from "./StatusBadge";
import UserAvatar from "../../../ui/UserAvatar";
import { uploadAvatarToServer } from "../../../../utils/avatar-upload";

interface PersonalInfoCardProps {
  profile: StudentProfile;
  isComplete: boolean;
  onProfileUpdate?: (updatedProfile: Partial<StudentProfile>) => void;
}

export const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({
  profile,
  isComplete,
  onProfileUpdate,
}) => {
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (file: File): Promise<void> => {
    try {
      setIsUploadingAvatar(true);

      const result = await uploadAvatarToServer(file, profile.id);

      if (result.success && result.url) {
        // Update profile with new avatar URL
        if (onProfileUpdate) {
          onProfileUpdate({ avatarUrl: result.url });
        }

        // Show success message (you can replace with toast notification)
        console.log('Avatar updated successfully!');
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error; // Re-throw to let AvatarUpload component handle error display
    } finally {
      setIsUploadingAvatar(false);
    }
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="h-28 bg-gradient-to-r from-[var(--brand-blue)] to-[var(--tw-blue-500)]"></div>
      <div className="px-6 pb-6 relative">
        <div className="flex flex-col items-center -mt-12 mb-4">
          <div className="relative">
            <UserAvatar
              src={profile.avatarUrl}
              name={profile.name}
              role="STUDENT"
              size="xl"
              showInitials={true}
              onAvatarUpload={handleAvatarUpload}
              clickable={true}
              className="border-4 border-white dark:border-slate-800 shadow-lg"
            />
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          <h2 className="mt-3 text-xl font-bold text-gray-900 dark:text-white">
            {profile.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Mã HS: {profile.id}
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 text-center max-w-48">
            Nhấp vào ảnh để cập nhật avatar
          </p>
        </div>

        <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
              Thông tin cá nhân
            </h3>
            <StatusBadge isComplete={isComplete} />
          </div>

          <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
            <div className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[var(--brand-blue)] shrink-0">
                <Mail size={16} />
              </div>
              <span className="truncate font-medium dark:text-slate-200">
                {profile.email}
              </span>
            </div>
            <div className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[var(--brand-blue)] shrink-0">
                <Phone size={16} />
              </div>
              <span className="font-medium dark:text-slate-200">
                {profile.phone}
              </span>
            </div>
            <div className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[var(--brand-blue)] shrink-0">
                <Calendar size={16} />
              </div>
              <span className="font-medium dark:text-slate-200">
                {profile.dob}
              </span>
            </div>
            <div className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[var(--brand-blue)] shrink-0">
                <MapPin size={16} />
              </div>
              <span className="font-medium dark:text-slate-200">
                {profile.address}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
