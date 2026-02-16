"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Edit3, User, BarChart3 } from "lucide-react";

interface ProfileHeaderProps {
  onEditClick: () => void;
  /** Link to profile analysis page. If set, shows "Đánh giá hồ sơ" button. */
  analyzeHref?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  onEditClick,
  analyzeHref,
}) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative rounded-2xl overflow-hidden mb-8 border border-primary/20 shadow-lg"
      aria-label="Tiêu đề hồ sơ"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,var(--tw-gradient-from),transparent)] from-primary/25 to-transparent" />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 4L4 20v20l26 16 26-16V20L30 4z' fill='none' stroke='%230f4c81' stroke-width='1'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-6 sm:px-8 sm:py-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-sm">
            <User className="size-6" aria-hidden />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Hồ sơ cá nhân
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Quản lý thông tin và tài liệu du học
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {analyzeHref && (
            <Link
              href={analyzeHref}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
            >
              <BarChart3 size={16} />
              Đánh giá hồ sơ
            </Link>
          )}
          <button
            type="button"
            onClick={onEditClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-border bg-card text-foreground hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
          >
            <Edit3 size={16} />
            Cập nhật hồ sơ
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-white/20 shadow-md">
              <Image
                src="/images/auth/left.jpg"
                alt=""
                fill
                className="object-cover"
                sizes="80px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
