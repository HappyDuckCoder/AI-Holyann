"use client";

import React, { useEffect, useState } from "react";
import { Building2, Loader2, ChevronRight } from "lucide-react";
import Link from "next/link";

interface SchoolWishlistCardProps {
  studentId: string | null;
}

type WishlistItem = { university_id: number; name: string; sort_order: number };

export const SchoolWishlistCard: React.FC<SchoolWishlistCardProps> = ({
  studentId,
}) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(!!studentId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/students/${studentId}/school-wishlist`)
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi tải wishlist");
        return res.json();
      })
      .then((data: { items?: WishlistItem[] }) => {
        if (!cancelled) {
          setItems(Array.isArray(data.items) ? data.items : []);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Lỗi");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  if (!studentId) return null;

  return (
    <section className="rounded-2xl border border-border shadow-sm overflow-hidden border-l-4 border-l-emerald-500/60 bg-card bg-gradient-to-br from-emerald-500/5 to-transparent">
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-emerald-500/5 transition-colors duration-300">
        <h3 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
          <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 shrink-0">
            <Building2 className="size-4" aria-hidden />
          </span>
          Wishlist trường
        </h3>
        <Link
          href="/student/universities"
          className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          Quản lý
          <ChevronRight className="size-4" />
        </Link>
      </div>
      <div className="p-4 sm:p-5">
        {loading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Chưa có trường trong wishlist. Vào Danh sách trường để chọn và lưu.
          </p>
        ) : (
          <ul className="space-y-2">
            {items
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((item, index) => (
                <li
                  key={`${item.university_id}-${item.sort_order}-${index}`}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-medium text-xs">
                    {index + 1}
                  </span>
                  <Link
                    href={`/student/universities/${item.university_id}`}
                    className="hover:underline text-foreground"
                  >
                    {item.name || `Trường #${item.university_id}`}
                  </Link>
                </li>
              ))}
          </ul>
        )}
      </div>
    </section>
  );
};
