"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { StudentPageContainer } from "@/components/student";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  FileUp,
  Loader2,
  Save,
  Upload,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { sanitizeHtml } from "@/lib/utils/validation";

type EssayItem = {
  id: string;
  slot_index: number;
  title: string | null;
  content: string;
  created_at: string;
  updated_at: string;
};

type CvDocItem = {
  id: string;
  slot_index: number;
  file_url: string;
  file_name: string;
  uploaded_at: string;
};

const ACCENT = "#0052FF";
const ACCENT_SEC = "#4D7CFF";
const easeOut = [0.16, 1, 0.3, 1] as const;
const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

function SlidePagination({
  total,
  current,
  onSelect,
}: {
  total: number;
  current: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-xl border-border transition-all hover:border-[var(--accent)]/30 hover:shadow-sm"
        disabled={current <= 1}
        onClick={() => onSelect(current - 1)}
        aria-label="Slide trước"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }, (_, i) => i + 1).map((idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Slide ${idx}`}
            aria-current={current === idx}
            onClick={() => onSelect(idx)}
            className={cn(
              "h-9 min-w-9 rounded-xl px-2.5 text-sm font-medium transition-all duration-200",
              current === idx
                ? "bg-gradient-to-r from-[var(--accent)] to-[#4D7CFF] text-white shadow-md shadow-[var(--accent)]/25"
                : "bg-muted/80 text-muted-foreground hover:bg-muted",
            )}
          >
            {idx}
          </button>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-xl border-border transition-all hover:border-[var(--accent)]/30 hover:shadow-sm"
        disabled={current >= total}
        onClick={() => onSelect(current + 1)}
        aria-label="Slide sau"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function EssayHtmlEditor({
  value,
  onChange,
  placeholder,
  disabled,
  className,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const handleBlur = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        ref={ref}
        contentEditable={!disabled}
        suppressContentEditableWarning
        role="textbox"
        aria-placeholder={placeholder}
        className={cn(
          "min-h-[200px] w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2",
          !value && "text-muted-foreground",
        )}
        onInput={handleInput}
        onBlur={handleBlur}
        style={{ minHeight: 200 }}
      />
    </div>
  );
}

export default function ManageUploadPage() {
  const { data: session } = useSession();
  const studentId = session?.user?.id as string | undefined;
  const cvInputRef = useRef<HTMLInputElement>(null);

  const [essayData, setEssayData] = useState<{
    essays: EssayItem[];
    maxSlots: number;
    plan: string;
  } | null>(null);
  const [essayLoading, setEssayLoading] = useState(true);
  const [essaySlide, setEssaySlide] = useState(1);
  const [essayDrafts, setEssayDrafts] = useState<Record<number, string>>({});
  const [essaySaving, setEssaySaving] = useState(false);

  const [cvData, setCvData] = useState<{
    documents: CvDocItem[];
    maxSlots: number;
    plan: string;
  } | null>(null);
  const [cvLoading, setCvLoading] = useState(true);
  const [cvSlide, setCvSlide] = useState(1);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvDeletingSlot, setCvDeletingSlot] = useState<number | null>(null);

  const loadEssays = useCallback(async () => {
    if (!studentId) return;
    setEssayLoading(true);
    try {
      const res = await fetch(
        `/api/students/${studentId}/manage-upload/essays`,
      );
      if (!res.ok) throw new Error("Lỗi tải essay");
      const data = await res.json();
      setEssayData({
        essays: data.essays ?? [],
        maxSlots: data.maxSlots ?? 2,
        plan: data.plan ?? "FREE",
      });
      const drafts: Record<number, string> = {};
      (data.essays ?? []).forEach((e: EssayItem) => {
        drafts[e.slot_index] = e.content ?? "";
      });
      setEssayDrafts(drafts);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi tải essay");
    } finally {
      setEssayLoading(false);
    }
  }, [studentId]);

  const loadCv = useCallback(async () => {
    if (!studentId) return;
    setCvLoading(true);
    try {
      const res = await fetch(
        `/api/students/${studentId}/manage-upload/cv-documents`,
      );
      if (!res.ok) throw new Error("Lỗi tải CV");
      const data = await res.json();
      setCvData({
        documents: data.documents ?? [],
        maxSlots: data.maxSlots ?? 2,
        plan: data.plan ?? "FREE",
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi tải CV");
    } finally {
      setCvLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadEssays();
  }, [loadEssays]);
  useEffect(() => {
    loadCv();
  }, [loadCv]);

  const saveEssay = async (slotIndex: number) => {
    if (!studentId) return;
    const raw = essayDrafts[slotIndex] ?? "";
    const content = sanitizeHtml(raw);
    setEssaySaving(true);
    try {
      const res = await fetch(
        `/api/students/${studentId}/manage-upload/essays`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slot_index: slotIndex, content }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi lưu essay");
      toast.success("Đã lưu essay");
      await loadEssays();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi lưu");
    } finally {
      setEssaySaving(false);
    }
  };

  const uploadCv = async (slotIndex: number, file: File) => {
    if (!studentId) return;
    if (file.type !== "application/pdf") {
      toast.error("Chỉ chấp nhận file PDF cho CV.");
      return;
    }
    setCvUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("documentType", "cv");
      form.append("slot_index", String(slotIndex));
      const res = await fetch(`/api/students/${studentId}/upload-cv`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi upload");
      toast.success("Đã tải CV lên");
      await loadCv();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi upload");
    } finally {
      setCvUploading(false);
    }
  };

  const triggerCvFileInput = (slot: number) => {
    if (cvUploading) return;
    (window as unknown as { __currentCvSlot?: number }).__currentCvSlot = slot;
    cvInputRef.current?.click();
  };

  const removeCv = async (slotIndex: number) => {
    if (!studentId) return;
    setCvDeletingSlot(slotIndex);
    try {
      const res = await fetch(
        `/api/students/${studentId}/manage-upload/cv-documents?slot_index=${slotIndex}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi gỡ CV");
      toast.success("Đã gỡ CV");
      await loadCv();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi gỡ CV");
    } finally {
      setCvDeletingSlot(null);
    }
  };

  const maxEssaySlots = essayData?.maxSlots ?? 2;
  const maxCvSlots = cvData?.maxSlots ?? 2;

  return (
    <StudentPageContainer className="min-h-[60vh] min-w-[320px]">
      <div className="mx-auto min-w-0">
        {/* Hero / Section label + headline */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative mb-10 overflow-hidden rounded-2xl border border-border bg-card px-6 py-8 shadow-md sm:px-10 sm:py-10"
        >
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-[0.06]"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SEC})`,
            }}
          />
          <div className="relative">
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-4 py-2"
            >
              <span
                className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse"
                style={{ backgroundColor: ACCENT }}
              />
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--accent)]">
                Tài liệu hồ sơ
              </span>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="mt-4 font-university-display text-2xl font-bold leading-tight text-foreground sm:text-3xl md:text-4xl"
            >
              <span className="relative inline-block">
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${ACCENT}, ${ACCENT_SEC})`,
                  }}
                >
                  Quản lý tài liệu
                </span>
                <span
                  className="pointer-events-none absolute -bottom-1 left-0 h-2 w-full rounded-full opacity-20"
                  style={{
                    background: `linear-gradient(to right, ${ACCENT}, ${ACCENT_SEC})`,
                  }}
                />
              </span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground"
            >
              Upload và quản lý Essay (chỉnh sửa HTML), CV theo từng ô. Free:
              tối đa 2 ô mỗi loại; Plus/Premium: 5 ô.
            </motion.p>
          </div>
        </motion.section>

        <input
          ref={cvInputRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          aria-hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            const slot = (window as unknown as { __currentCvSlot?: number })
              .__currentCvSlot;
            if (f && typeof slot === "number") uploadCv(slot, f);
            e.target.value = "";
          }}
        />

        {/* Section Essay */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="mb-12 rounded-2xl border border-border bg-card p-6 shadow-md transition-shadow hover:shadow-lg sm:p-8"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
              style={{
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SEC})`,
                boxShadow: "0 4px 14px rgba(0, 82, 255, 0.25)",
              }}
            >
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Essay
              </h2>
              <p className="text-sm text-muted-foreground">
                Chỉnh sửa dạng HTML. Tối đa {maxEssaySlots} essay theo gói.
              </p>
            </div>
          </div>
          {essayLoading ? (
            <div className="mt-8 flex items-center justify-center py-16">
              <Loader2
                className="h-8 w-8 animate-spin text-muted-foreground"
                style={{ color: ACCENT }}
              />
            </div>
          ) : (
            <>
              <div className="mt-6">
                {Array.from({ length: maxEssaySlots }, (_, i) => i + 1).map(
                  (slot) => (
                    <div
                      key={slot}
                      className={cn(
                        "rounded-xl border border-border bg-muted/20 p-5 transition-colors",
                        essaySlide === slot ? "block" : "hidden",
                      )}
                    >
                      <label className="text-sm font-medium text-foreground">
                        Essay {slot}
                      </label>
                      <EssayHtmlEditor
                        value={essayDrafts[slot] ?? ""}
                        onChange={(html) =>
                          setEssayDrafts((prev) => ({ ...prev, [slot]: html }))
                        }
                        placeholder="Dán hoặc soạn nội dung essay (HTML)..."
                        disabled={essaySaving}
                        className="mt-3"
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="mt-4 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[#4D7CFF] px-5 font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110"
                        disabled={essaySaving}
                        onClick={() => saveEssay(slot)}
                      >
                        {essaySaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Lưu
                          </>
                        )}
                      </Button>
                    </div>
                  ),
                )}
              </div>
              <SlidePagination
                total={maxEssaySlots}
                current={essaySlide}
                onSelect={setEssaySlide}
              />
            </>
          )}
        </motion.section>

        {/* Section CV */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="rounded-2xl border border-border bg-card p-6 shadow-md transition-shadow hover:shadow-lg sm:p-8"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
              style={{
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SEC})`,
                boxShadow: "0 4px 14px rgba(0, 82, 255, 0.25)",
              }}
            >
              <FileUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                CV (PDF)
              </h2>
              <p className="text-sm text-muted-foreground">
                Tải lên file PDF cho từng slide. Tối đa {maxCvSlots} CV theo
                gói.
              </p>
            </div>
          </div>
          {cvLoading ? (
            <div className="mt-8 flex items-center justify-center py-16">
              <Loader2
                className="h-8 w-8 animate-spin text-muted-foreground"
                style={{ color: ACCENT }}
              />
            </div>
          ) : (
            <>
              <div className="mt-6">
                {Array.from({ length: maxCvSlots }, (_, i) => i + 1).map(
                  (slot) => {
                    const doc = cvData?.documents?.find(
                      (d) => d.slot_index === slot,
                    );
                    return (
                      <div
                        key={slot}
                        className={cn(
                          "rounded-xl border border-border bg-muted/20 p-5",
                          cvSlide === slot ? "block" : "hidden",
                        )}
                      >
                        <label className="text-sm font-medium text-foreground">
                          CV {slot}
                        </label>
                        {doc ? (
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-[var(--accent)] underline underline-offset-2 transition-colors hover:brightness-110"
                              style={{ color: ACCENT }}
                            >
                              {doc.file_name}
                            </a>
                            <span className="text-xs text-muted-foreground">
                              (đã tải lên)
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-xl border-destructive/50 text-destructive hover:bg-destructive/10"
                              disabled={cvDeletingSlot !== null}
                              onClick={() => removeCv(slot)}
                            >
                              {cvDeletingSlot === slot ? (
                                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="mr-1.5 h-4 w-4" />
                              )}
                              Gỡ CV
                            </Button>
                          </div>
                        ) : null}
                        {!doc && (
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <Button
                              type="button"
                              onClick={() => triggerCvFileInput(slot)}
                              disabled={cvUploading}
                              className="rounded-xl bg-gradient-to-r from-[var(--accent)] to-[#4D7CFF] px-5 font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110"
                            >
                              {cvUploading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Upload className="mr-2 h-4 w-4" />
                              )}
                              Tải CV lên
                            </Button>
                            <span className="text-xs text-muted-foreground">
                              Chỉ PDF
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
              <SlidePagination
                total={maxCvSlots}
                current={cvSlide}
                onSelect={setCvSlide}
              />
            </>
          )}
        </motion.section>
      </div>
    </StudentPageContainer>
  );
}
