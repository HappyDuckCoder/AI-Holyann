"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, Bookmark, ArrowDown } from "lucide-react";

type FacultyItem = {
  faculty_name: string;
  match_score: number;
  reason?: string;
};

interface FacultyWishlistSectionProps {
  studentId: string | null;
}

const ACCENT = "#0052FF";
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function FacultyWishlistSection({ studentId }: FacultyWishlistSectionProps) {
  const [loading, setLoading] = useState(true);
  const [faculties, setFaculties] = useState<FacultyItem[]>([]);
  const [wishlistLimit, setWishlistLimit] = useState(2);
  const [wishlistSaved, setWishlistSaved] = useState<{ faculty_name: string; sort_order: number }[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
  const [wishlistSaving, setWishlistSaving] = useState(false);
  const [wishlistError, setWishlistError] = useState<string | null>(null);

  const fetchLatest = useCallback(async (sid: string) => {
    try {
      const res = await fetch(`/api/students/${sid}/recommend-faculty/latest`);
      if (!res.ok) return;
      const data = await res.json();
      const rec = data.recommendation;
      if (rec?.faculties && Array.isArray(rec.faculties) && rec.faculties.length > 0) {
        setFaculties(rec.faculties);
      }
    } catch {
      setFaculties([]);
    }
  }, []);

  const fetchWishlistAndLimits = useCallback(async (sid: string) => {
    try {
      const [limRes, listRes] = await Promise.all([
        fetch(`/api/students/${sid}/faculty-wishlist/limits`),
        fetch(`/api/students/${sid}/faculty-wishlist`),
      ]);
      if (limRes.ok) {
        const d = await limRes.json();
        setWishlistLimit(typeof d.limit === "number" ? d.limit : 2);
      }
      if (listRes.ok) {
        const d = await listRes.json();
        const items = (d.items ?? []) as { faculty_name: string; sort_order: number }[];
        setWishlistSaved(items);
      }
    } catch {
      setWishlistError("Không tải được wishlist");
    }
  }, []);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchLatest(studentId).finally(() => setLoading(false));
  }, [studentId, fetchLatest]);

  useEffect(() => {
    if (!studentId || faculties.length === 0) return;
    fetchWishlistAndLimits(studentId);
  }, [studentId, faculties.length, fetchWishlistAndLimits]);

  const facultiesListKey = useMemo(
    () => faculties.map((f) => f.faculty_name).sort().join(","),
    [faculties]
  );
  useEffect(() => {
    if (faculties.length === 0) return;
    const names = wishlistSaved
      .filter((w) => faculties.some((f) => f.faculty_name === w.faculty_name))
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((w) => w.faculty_name);
    setSelectedOrder(names);
  }, [wishlistSaved, facultiesListKey, faculties]);

  const toggleWishlistFaculty = useCallback(
    (facultyName: string) => {
      setSelectedOrder((prev) => {
        const idx = prev.indexOf(facultyName);
        if (idx >= 0) return prev.filter((n) => n !== facultyName);
        if (prev.length >= wishlistLimit) return prev;
        return [...prev, facultyName];
      });
      setWishlistError(null);
    },
    [wishlistLimit]
  );

  const handleSaveWishlist = useCallback(async () => {
    if (!studentId) return;
    setWishlistSaving(true);
    setWishlistError(null);
    try {
      const res = await fetch(`/api/students/${studentId}/faculty-wishlist`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: selectedOrder.map((faculty_name, sort_order) => ({
            faculty_name,
            sort_order,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setWishlistError(data?.error || "Không lưu được wishlist");
        return;
      }
      setWishlistSaved(data.items ?? []);
    } catch (e) {
      setWishlistError(e instanceof Error ? e.message : "Lỗi lưu wishlist");
    } finally {
      setWishlistSaving(false);
    }
  }, [studentId, selectedOrder]);

  const hasRecommendResult = faculties.length > 0;
  const isSaveDisabled =
    wishlistSaving ||
    (() => {
      const savedNames = wishlistSaved
        .filter((w) => faculties.some((f) => f.faculty_name === w.faculty_name))
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((w) => w.faculty_name);
      return (
        selectedOrder.length === savedNames.length &&
        selectedOrder.every((name, i) => savedNames[i] === name)
      );
    })();

  if (!studentId) return null;

  if (loading) {
    return (
      <motion.section
        className="mt-10 rounded-2xl border border-border bg-card p-6"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Đang tải...</span>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-md"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
    >
      <div className="flex items-center gap-2 mb-2">
        <Bookmark className="h-5 w-5 text-[#0052FF]" />
        <h3 className="font-heading text-lg font-semibold text-foreground">
          Wishlist ngành yêu thích
        </h3>
      </div>

      {!hasRecommendResult ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4">
          <p className="text-sm text-foreground mb-3">
            Bạn cần <strong>thực hiện gợi ý ngành học</strong> trước để chọn wishlist ngành yêu thích từ danh sách gợi ý.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() =>
              document.getElementById("recommend-faculty-section")?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <ArrowDown className="h-4 w-4 mr-2" />
            Đi tới phần Gợi ý ngành học
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Chọn tối đa {wishlistLimit} ngành từ danh sách gợi ý (Free: 2, Plus: 5, Premium: 10). Thứ tự chọn = ưu tiên.
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {faculties.map((f) => {
              const checked = selectedOrder.includes(f.faculty_name);
              const atLimit = selectedOrder.length >= wishlistLimit && !checked;
              return (
                <label
                  key={f.faculty_name}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
                    checked
                      ? "border-[#0052FF]/50 bg-[#0052FF]/10 text-foreground"
                      : atLimit
                        ? "border-border bg-muted/30 text-muted-foreground cursor-not-allowed"
                        : "border-border bg-background hover:border-[#0052FF]/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={atLimit}
                    onChange={() => toggleWishlistFaculty(f.faculty_name)}
                    className="rounded border-[#0052FF] text-[#0052FF] focus:ring-[#0052FF]"
                  />
                  <span className="font-medium">{f.faculty_name}</span>
                  {checked && (
                    <span className="text-xs text-[#0052FF] tabular-nums">
                      #{selectedOrder.indexOf(f.faculty_name) + 1}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Đã chọn {selectedOrder.length} / {wishlistLimit} ngành
          </p>
          {wishlistError && (
            <p className="text-sm text-destructive mb-2">{wishlistError}</p>
          )}
          <Button
            onClick={handleSaveWishlist}
            disabled={isSaveDisabled}
            className="rounded-xl bg-[#0052FF] hover:bg-[#0046e0] text-white"
          >
            {wishlistSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Lưu wishlist ngành"
            )}
          </Button>
        </>
      )}
    </motion.section>
  );
}
