"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Globe, Pencil, Check, X, Plus, Trash2 } from "lucide-react";
import { StudentProfile, EnglishCertificate } from "../../../types";
import { StatusBadge } from "./StatusBadge";

interface AcademicInfoSectionProps {
  profile: StudentProfile;
  isComplete: boolean;
  onSave?: (data: {
    gpa: number;
    gpaScale: number;
    englishCertificates: EnglishCertificate[];
    targetMajor: string;
    targetCountry: string;
  }) => void;
}

const GPA_MIN = 0;
const GPA_MAX = 10;
const GPA_SCALE = 10;

export const AcademicInfoSection: React.FC<AcademicInfoSectionProps> = ({
  profile,
  isComplete,
  onSave,
}) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    gpa: profile.gpa,
    gpaScale: GPA_SCALE,
    englishCertificates: (profile.englishCertificates && profile.englishCertificates.length > 0
      ? profile.englishCertificates
      : [{ type: "", score: "" }]) as EnglishCertificate[],
    targetMajor: profile.targetMajor,
    targetCountry: profile.targetCountry,
  });

  useEffect(() => {
    setForm({
      gpa: profile.gpa,
      gpaScale: GPA_SCALE,
      englishCertificates:
        profile.englishCertificates && profile.englishCertificates.length > 0
          ? [...profile.englishCertificates]
          : [{ type: "", score: "" }],
      targetMajor: profile.targetMajor,
      targetCountry: profile.targetCountry,
    });
  }, [
    profile.gpa,
    profile.englishCertificates,
    profile.targetMajor,
    profile.targetCountry,
  ]);

  const handleSave = () => {
    const gpa = Math.min(GPA_MAX, Math.max(GPA_MIN, Number(form.gpa) || 0));
    const certs = form.englishCertificates.filter(
      (c) => (c.type || "").trim() || (c.score || "").trim()
    );
    onSave?.({
      ...form,
      gpa,
      gpaScale: GPA_SCALE,
      englishCertificates: certs.length > 0 ? certs : [],
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setForm({
      gpa: profile.gpa,
      gpaScale: GPA_SCALE,
      englishCertificates:
        profile.englishCertificates && profile.englishCertificates.length > 0
          ? [...profile.englishCertificates]
          : [{ type: "", score: "" }],
      targetMajor: profile.targetMajor,
      targetCountry: profile.targetCountry,
    });
    setEditing(false);
  };

  const addCert = () => {
    setForm((f) => ({
      ...f,
      englishCertificates: [...f.englishCertificates, { type: "", score: "" }],
    }));
  };

  const updateCert = (index: number, field: "type" | "score", value: string) => {
    setForm((f) => ({
      ...f,
      englishCertificates: f.englishCertificates.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      ),
    }));
  };

  const removeCert = (index: number) => {
    setForm((f) => ({
      ...f,
      englishCertificates: f.englishCertificates.filter((_, i) => i !== index),
    }));
  };

  return (
    <section className="rounded-2xl border border-border shadow-sm overflow-hidden border-l-4 border-l-amber-500/60 bg-card bg-gradient-to-br from-amber-500/5 to-transparent">
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-amber-500/5 transition-colors duration-300">
        <h3 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
          <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0">
            <BookOpen className="size-4" aria-hidden />
          </span>
          Thông tin học thuật
        </h3>
        <div className="flex items-center gap-2">
          {onSave &&
            (editing ? (
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={handleSave}
                  className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
                title="Chỉnh sửa"
              >
                <Pencil size={14} />
              </button>
            ))}
          <StatusBadge isComplete={isComplete} />
        </div>
      </div>
      <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-xl border border-border bg-muted/20 transition-colors duration-300">
          <p className="text-xs font-medium text-muted-foreground mb-1">GPA (thang 10)</p>
          {editing ? (
            <div className="flex items-baseline gap-1 flex-wrap">
              <input
                type="number"
                step="0.1"
                min={GPA_MIN}
                max={GPA_MAX}
                value={form.gpa}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  const clamped = Number.isNaN(v) ? 0 : Math.min(GPA_MAX, Math.max(GPA_MIN, v));
                  setForm((f) => ({ ...f, gpa: clamped }));
                }}
                className="w-16 bg-card border border-border rounded px-2 py-1 text-foreground"
              />
              <span className="text-sm text-muted-foreground">/ {GPA_SCALE}</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-foreground">{profile.gpa}</span>
              <span className="text-sm text-muted-foreground">/ {GPA_SCALE}</span>
            </div>
          )}
        </div>
        <div className="p-3 sm:p-4 rounded-xl border border-border bg-muted/20 sm:col-span-1 md:col-span-2 transition-colors duration-300">
          <p className="text-xs font-medium text-muted-foreground mb-1">Ngoại ngữ</p>
          {editing ? (
            <div className="space-y-2">
              {form.englishCertificates.map((cert, index) => (
                <div key={index} className="flex gap-2 items-center flex-wrap">
                  <input
                    value={cert.type}
                    onChange={(e) => updateCert(index, "type", e.target.value)}
                    className="flex-1 min-w-[80px] max-w-[120px] bg-card border border-border rounded px-2 py-1 text-foreground text-sm"
                    placeholder="IELTS, TOEFL..."
                  />
                  <input
                    value={cert.score}
                    onChange={(e) => updateCert(index, "score", e.target.value)}
                    className="w-20 bg-card border border-border rounded px-2 py-1 text-foreground text-sm"
                    placeholder="7.0"
                  />
                  <button
                    type="button"
                    onClick={() => removeCert(index)}
                    className="p-1.5 rounded text-muted-foreground hover:bg-muted"
                    title="Xóa"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addCert}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Plus size={14} /> Thêm ngoại ngữ
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <Globe size={16} className="text-primary shrink-0 mt-0.5" />
              {(profile.englishCertificates?.length ?? 0) > 0 ? (
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  {/* Chia thành các cột, mỗi cột 3 chứng chỉ */}
                  {Array.from({ length: Math.ceil((profile.englishCertificates ?? []).length / 3) }).map((_, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-1">
                      {(profile.englishCertificates ?? [])
                        .slice(colIndex * 3, colIndex * 3 + 3)
                        .map((c, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            <span className="font-medium text-foreground whitespace-nowrap">
                              {c.type} {c.score}
                            </span>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">{profile.englishLevel || "Chưa cập nhật"}</span>
              )}
            </div>
          )}
        </div>
        <div className="p-3 sm:p-4 rounded-xl border border-border bg-muted/20 sm:col-span-2 md:col-span-3 transition-colors duration-300">
          <p className="text-xs font-medium text-muted-foreground mb-1">Mục tiêu</p>
          {editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                value={form.targetMajor}
                onChange={(e) => setForm((f) => ({ ...f, targetMajor: e.target.value }))}
                className="bg-card border border-border rounded px-2 py-1 text-foreground text-sm"
                placeholder="Ngành học"
              />
              <input
                value={form.targetCountry}
                onChange={(e) => setForm((f) => ({ ...f, targetCountry: e.target.value }))}
                className="bg-card border border-border rounded px-2 py-1 text-foreground text-sm"
                placeholder="Quốc gia"
              />
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">{profile.targetMajor}</span>
              <span className="text-xs text-muted-foreground">{profile.targetCountry}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
