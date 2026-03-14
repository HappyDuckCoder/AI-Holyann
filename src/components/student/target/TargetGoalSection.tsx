"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Target, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ACCENT = "#0052FF";

export type TargetGoalOption = {
  faculty_name: string;
  university_id: number | null;
  university_name: string;
  /** Unique key for select (faculty + university) */
  value: string;
};

export type TargetGoalData = {
  target_faculty_name: string | null;
  target_university_id: number | null;
  target_university_name: string | null;
  target_set_at: string | null;
  already_set: boolean;
};

interface TargetGoalSectionProps {
  studentId: string | null;
  /** Danh sách (ngành @ trường) từ kết quả Reach/Match/Safety */
  options: TargetGoalOption[];
  /** Đã thiết lập rồi thì chỉ hiển thị, không cho sửa */
  currentGoal: TargetGoalData | null;
  onSaved?: () => void;
}

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function TargetGoalSection({
  studentId,
  options,
  currentGoal,
  onSaved,
}: TargetGoalSectionProps) {
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const alreadySet = currentGoal?.already_set ?? false;
  const hasOptions = options.length > 0;

  const handleSave = useCallback(async () => {
    if (!studentId || !selectedValue) return;
    const opt = options.find((o) => o.value === selectedValue);
    if (!opt) return;
    setConfirmOpen(false);
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/students/${studentId}/target-goal`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          faculty_name: opt.faculty_name,
          university_id: opt.university_id,
          university_name: opt.university_name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Lỗi lưu mục tiêu");
        return;
      }
      onSaved?.();
    } catch (e) {
      setError("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  }, [studentId, selectedValue, options, onSaved]);

  if (!studentId) return null;

  return (
    <>
      <motion.section
        className="rounded-2xl border border-border bg-card p-6 shadow-md"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="inline-flex items-center gap-3 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 px-4 py-2 mb-4">
          <Target className="size-4 text-[#0052FF]" />
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#0052FF]">
            Thiết lập mục tiêu
          </span>
        </div>
        <p className="text-muted-foreground text-sm mb-4">
          Chọn một ngành trong trường mà bạn muốn nhắm tới. Chỉ được thiết lập <strong>một lần duy nhất</strong>.
        </p>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-4">
            {error}
          </div>
        )}

        {alreadySet ? (
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
            <p className="text-sm font-medium text-foreground">
              Mục tiêu của bạn:{" "}
              <span className="text-[#0052FF]">
                {currentGoal?.target_faculty_name ?? "—"} tại {currentGoal?.target_university_name ?? "—"}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Đã thiết lập — không thể thay đổi.
            </p>
          </div>
        ) : !hasOptions ? (
          <p className="text-sm text-muted-foreground py-2">
            Chạy đánh giá Reach / Match / Safety trước để mở khóa chọn mục tiêu (ngành @ trường).
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedValue} onValueChange={setSelectedValue}>
              <SelectTrigger className="w-full sm:max-w-md">
                <SelectValue placeholder="Chọn ngành tại trường..." />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.faculty_name} — {opt.university_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={!selectedValue || saving}
              className="rounded-xl bg-[#0052FF] hover:bg-[#0046e0]"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Lưu mục tiêu
            </Button>
          </div>
        )}
      </motion.section>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="gap-4 p-6 sm:p-6 max-w-lg">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="size-5 shrink-0" />
              <DialogTitle className="text-lg font-semibold leading-none tracking-tight">
                Xác nhận thiết lập mục tiêu
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              Bạn chỉ được thiết lập mục tiêu <strong>một lần duy nhất</strong>. Sau khi lưu sẽ không thể thay đổi. Bạn có chắc muốn lưu?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Xác nhận lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
