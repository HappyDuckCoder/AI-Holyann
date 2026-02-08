"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Globe, Pencil, Check, X } from "lucide-react";
import { StudentProfile } from "../../../types";
import { StatusBadge } from "./StatusBadge";

interface AcademicInfoSectionProps {
  profile: StudentProfile;
  isComplete: boolean;
  onSave?: (data: {
    gpa: number;
    gpaScale: number;
    englishLevel: string;
    targetMajor: string;
    targetCountry: string;
  }) => void;
}

export const AcademicInfoSection: React.FC<AcademicInfoSectionProps> = ({
  profile,
  isComplete,
  onSave,
}) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    gpa: profile.gpa,
    gpaScale: profile.gpaScale,
    englishLevel: profile.englishLevel,
    targetMajor: profile.targetMajor,
    targetCountry: profile.targetCountry,
  });

  useEffect(() => {
    setForm({
      gpa: profile.gpa,
      gpaScale: profile.gpaScale,
      englishLevel: profile.englishLevel,
      targetMajor: profile.targetMajor,
      targetCountry: profile.targetCountry,
    });
  }, [profile.gpa, profile.gpaScale, profile.englishLevel, profile.targetMajor, profile.targetCountry]);

  const handleSave = () => {
    onSave?.(form);
    setEditing(false);
  };

  const handleCancel = () => {
    setForm({
      gpa: profile.gpa,
      gpaScale: profile.gpaScale,
      englishLevel: profile.englishLevel,
      targetMajor: profile.targetMajor,
      targetCountry: profile.targetCountry,
    });
    setEditing(false);
  };

  return (
    <section className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border/60 flex justify-between items-center bg-muted/30">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="text-primary" size={18} />
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
      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border/60 bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground mb-1">GPA</p>
          {editing ? (
            <div className="flex items-baseline gap-1 flex-wrap">
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={form.gpa || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, gpa: parseFloat(e.target.value) || 0 }))
                }
                className="w-16 bg-background border border-border rounded px-2 py-1 text-foreground"
              />
              <span className="text-sm text-muted-foreground">/</span>
              <input
                type="number"
                step="0.1"
                min="0"
                value={form.gpaScale || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, gpaScale: parseFloat(e.target.value) || 10 }))
                }
                className="w-14 bg-background border border-border rounded px-2 py-1 text-foreground"
              />
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-foreground">{profile.gpa}</span>
              <span className="text-sm text-muted-foreground">/ {profile.gpaScale}</span>
            </div>
          )}
        </div>
        <div className="p-4 rounded-xl border border-border/60 bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground mb-1">Ngoại ngữ</p>
          {editing ? (
            <input
              value={form.englishLevel}
              onChange={(e) => setForm((f) => ({ ...f, englishLevel: e.target.value }))}
              className="w-full bg-background border border-border rounded px-2 py-1 text-foreground"
              placeholder="vd: IELTS 7.0"
            />
          ) : (
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-primary" />
              <span className="font-semibold text-foreground">{profile.englishLevel}</span>
            </div>
          )}
        </div>
        <div className="p-4 rounded-xl border border-border/60 bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground mb-1">Mục tiêu</p>
          {editing ? (
            <div className="space-y-1">
              <input
                value={form.targetMajor}
                onChange={(e) => setForm((f) => ({ ...f, targetMajor: e.target.value }))}
                className="w-full bg-background border border-border rounded px-2 py-1 text-foreground text-sm"
                placeholder="Ngành học"
              />
              <input
                value={form.targetCountry}
                onChange={(e) => setForm((f) => ({ ...f, targetCountry: e.target.value }))}
                className="w-full bg-background border border-border rounded px-2 py-1 text-foreground text-sm"
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
