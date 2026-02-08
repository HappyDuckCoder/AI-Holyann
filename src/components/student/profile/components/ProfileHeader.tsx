"use client";

import React from "react";
import { Edit3 } from "lucide-react";

interface ProfileHeaderProps {
  onEditClick: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  onEditClick,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Hồ sơ cá nhân
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Quản lý thông tin và tài liệu du học
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onEditClick}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border bg-card text-foreground hover:bg-muted/50 transition-colors"
        >
          <Edit3 size={16} />
          Cập nhật hồ sơ
        </button>
      </div>
    </div>
  );
};
