"use client";

import React from "react";
import { BookmarkCheck } from "lucide-react";
import { FacultyWishlistCard } from "./FacultyWishlistCard";
import { SchoolWishlistCard } from "./SchoolWishlistCard";

interface ProfileWishlistSectionProps {
  studentId: string | null;
}

export const ProfileWishlistSection: React.FC<ProfileWishlistSectionProps> = ({
  studentId,
}) => {
  if (!studentId) return null;

  return (
    <section
      aria-labelledby="profile-wishlist-heading"
      className="flex flex-col gap-4 sm:gap-6"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BookmarkCheck className="size-5" aria-hidden />
        </span>
        <div>
          <h2
            id="profile-wishlist-heading"
            className="text-base sm:text-lg font-semibold text-foreground"
          >
            Wishlist của tôi
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Ngành học và trường đại học bạn quan tâm — quản lý từ bài test và danh sách trường
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="min-w-0">
          <FacultyWishlistCard studentId={studentId} />
        </div>
        <div className="min-w-0">
          <SchoolWishlistCard studentId={studentId} />
        </div>
      </div>
    </section>
  );
};
