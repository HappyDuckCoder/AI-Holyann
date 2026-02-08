"use client";

import React, { useState } from "react";
import { Award, GraduationCap, Edit3, Pencil, Check, X, Trash2, Plus } from "lucide-react";
import { StudentProfile, Extracurricular } from "../../../types";
import { StatusBadge } from "./StatusBadge";

type AchievementItem = string | { id: string; text: string; category?: "academic" | "non_academic" };

interface ActivitiesSectionProps {
  profile: StudentProfile;
  isComplete: boolean;
  onEditClick?: () => void;
  onUpdateActivity?: (act: Extracurricular) => void;
  onAddActivity?: (act: Omit<Extracurricular, "id">) => void;
  onDeleteActivity?: (id: string) => void;
  onUpdateAchievement?: (id: string, text: string) => void;
  onAddAchievement?: (text: string, category: "academic" | "non_academic") => void;
  onDeleteAchievement?: (id: string) => void;
}

const TAG_STYLE = "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium";

function getAchievementText(a: AchievementItem): string {
  return typeof a === "string" ? a : a.text;
}

function getAchievementId(a: AchievementItem): string | null {
  return typeof a === "string" ? null : a.id;
}

export const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({
  profile,
  isComplete,
  onEditClick,
  onUpdateActivity,
  onAddActivity,
  onDeleteActivity,
  onUpdateAchievement,
  onAddAchievement,
  onDeleteAchievement,
}) => {
  const [editingActId, setEditingActId] = useState<string | null>(null);
  const [editingAchId, setEditingAchId] = useState<string | null>(null);
  const [addingAct, setAddingAct] = useState(false);
  const [addingAch, setAddingAch] = useState(false);
  const [newAct, setNewAct] = useState({
    title: "",
    role: "Thành viên",
    year: new Date().getFullYear().toString(),
    description: "",
    category: "academic" as ActivityCategory,
  });
  const [newAch, setNewAch] = useState<{ text: string; category: "academic" | "non_academic" }>({
    text: "",
    category: "academic",
  });
  const [editActForm, setEditActForm] = useState<Extracurricular | null>(null);
  const [editAchText, setEditAchText] = useState("");

  type ActivityCategory = "academic" | "non_academic";
  const hasActivities = profile.extracurriculars.length > 0;
  const hasAchievements = profile.achievements.length > 0;
  const needSupplement = !isComplete && (!hasActivities || !hasAchievements);

  const startEditAct = (act: Extracurricular) => {
    setEditingActId(act.id);
    setEditActForm({ ...act });
  };

  const saveAct = async () => {
    if (!editActForm || !onUpdateActivity) return;
    try {
      await Promise.resolve(onUpdateActivity(editActForm));
      setEditingActId(null);
      setEditActForm(null);
    } catch (_) {}
  };

  const addAct = async () => {
    if (!newAct.title.trim() || !onAddActivity) return;
    try {
      await Promise.resolve(
        onAddActivity({
          title: newAct.title.trim(),
          role: newAct.role,
          year: newAct.year,
          description: newAct.description,
          category: newAct.category,
        })
      );
      setNewAct({
        title: "",
        role: "Thành viên",
        year: new Date().getFullYear().toString(),
        description: "",
        category: "academic",
      });
      setAddingAct(false);
    } catch (_) {}
  };

  const startEditAch = (a: AchievementItem) => {
    const id = getAchievementId(a);
    if (id) {
      setEditingAchId(id);
      setEditAchText(getAchievementText(a));
    }
  };

  const saveAch = async () => {
    if (!editingAchId || !onUpdateAchievement) return;
    try {
      await Promise.resolve(onUpdateAchievement(editingAchId, editAchText));
      setEditingAchId(null);
      setEditAchText("");
    } catch (_) {}
  };

  const addAch = async () => {
    if (!newAch.text.trim() || !onAddAchievement) return;
    try {
      await Promise.resolve(onAddAchievement(newAch.text.trim(), newAch.category));
      setNewAch({ text: "", category: "academic" });
      setAddingAch(false);
    } catch (_) {}
  };

  return (
    <section className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border/60 flex flex-wrap items-center justify-between gap-3 bg-muted/30">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Award className="text-primary" size={18} />
          Hoạt động & Thành tích
        </h3>
        <StatusBadge isComplete={isComplete} />
      </div>

      {needSupplement && onEditClick && (
        <div className="px-5 py-3 bg-muted/50 border-b border-border flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Cần bổ sung hoạt động hoặc thành tích.
          </p>
          <button
            type="button"
            onClick={onEditClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Edit3 size={14} />
            Bổ sung
          </button>
        </div>
      )}

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hoạt động ngoại khóa */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Hoạt động ngoại khóa
          </h4>
          <div className="space-y-3">
            {hasActivities &&
              profile.extracurriculars.map((act) => (
                <div
                  key={act.id}
                  className="pl-3 border-l-2 border-primary/30 hover:border-primary/60 transition-colors"
                >
                  {editingActId === act.id && editActForm ? (
                    <div className="space-y-2">
                      <input
                        value={editActForm.title}
                        onChange={(e) =>
                          setEditActForm((f) => (f ? { ...f, title: e.target.value } : f))
                        }
                        className="w-full text-sm bg-background border border-border rounded px-2 py-1"
                        placeholder="Tên hoạt động"
                      />
                      <div className="flex gap-2 flex-wrap">
                        <input
                          value={editActForm.role}
                          onChange={(e) =>
                            setEditActForm((f) => (f ? { ...f, role: e.target.value } : f))
                          }
                          className="flex-1 min-w-0 text-xs bg-background border border-border rounded px-2 py-1"
                          placeholder="Vai trò"
                        />
                        <input
                          value={editActForm.year}
                          onChange={(e) =>
                            setEditActForm((f) => (f ? { ...f, year: e.target.value } : f))
                          }
                          className="w-16 text-xs bg-background border border-border rounded px-2 py-1"
                          placeholder="Năm"
                        />
                      </div>
                      <textarea
                        value={editActForm.description}
                        onChange={(e) =>
                          setEditActForm((f) => (f ? { ...f, description: e.target.value } : f))
                        }
                        rows={2}
                        className="w-full text-xs bg-background border border-border rounded px-2 py-1"
                        placeholder="Mô tả"
                      />
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={saveAct}
                          className="p-1.5 rounded bg-primary text-primary-foreground"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingActId(null);
                            setEditActForm(null);
                          }}
                          className="p-1.5 rounded bg-muted text-muted-foreground"
                        >
                          <X size={12} />
                        </button>
                        {onDeleteActivity && (
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteActivity(act.id);
                              setEditingActId(null);
                              setEditActForm(null);
                            }}
                            className="p-1.5 rounded text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-medium text-foreground text-sm">{act.title}</h5>
                        {onUpdateActivity && (
                          <button
                            type="button"
                            onClick={() => startEditAct(act)}
                            className="p-1 rounded text-muted-foreground hover:bg-muted shrink-0"
                          >
                            <Pencil size={12} />
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span
                          className={`${TAG_STYLE} bg-primary/10 text-primary border border-primary/20`}
                        >
                          {act.role}
                        </span>
                        <span
                          className={`${TAG_STYLE} bg-muted text-muted-foreground border border-border/60`}
                        >
                          {act.year}
                        </span>
                        {act.category && (
                          <span
                            className={`${TAG_STYLE} ${
                              act.category === "academic"
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "bg-muted text-muted-foreground border border-border"
                            }`}
                          >
                            {act.category === "academic" ? "Học thuật" : "Ngoại khóa"}
                          </span>
                        )}
                      </div>
                      {act.description && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                          {act.description}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            {addingAct && (
              <div className="pl-3 border-l-2 border-dashed border-border space-y-2">
                <input
                  value={newAct.title}
                  onChange={(e) => setNewAct((f) => ({ ...f, title: e.target.value }))}
                  className="w-full text-sm bg-background border border-border rounded px-2 py-1"
                  placeholder="Tên hoạt động"
                />
                <div className="flex gap-2 flex-wrap">
                  <input
                    value={newAct.role}
                    onChange={(e) => setNewAct((f) => ({ ...f, role: e.target.value }))}
                    className="flex-1 min-w-0 text-xs bg-background border border-border rounded px-2 py-1"
                    placeholder="Vai trò"
                  />
                  <input
                    value={newAct.year}
                    onChange={(e) => setNewAct((f) => ({ ...f, year: e.target.value }))}
                    className="w-16 text-xs bg-background border border-border rounded px-2 py-1"
                    placeholder="Năm"
                  />
                  <select
                    value={newAct.category}
                    onChange={(e) =>
                      setNewAct((f) => ({
                        ...f,
                        category: e.target.value as ActivityCategory,
                      }))
                    }
                    className="text-xs bg-background border border-border rounded px-2 py-1"
                  >
                    <option value="academic">Học thuật</option>
                    <option value="non_academic">Ngoại khóa</option>
                  </select>
                </div>
                <textarea
                  value={newAct.description}
                  onChange={(e) => setNewAct((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full text-xs bg-background border border-border rounded px-2 py-1"
                  placeholder="Mô tả"
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={addAct}
                    className="p-1.5 rounded bg-primary text-primary-foreground text-xs"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingAct(false)}
                    className="p-1.5 rounded bg-muted text-muted-foreground text-xs"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
            {!hasActivities && !addingAct && (
              <p className="text-sm text-muted-foreground italic py-2">
                Chưa cập nhật hoạt động
              </p>
            )}
            {onAddActivity && (
              <button
                type="button"
                onClick={() => setAddingAct(true)}
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <Plus size={14} />
                Thêm hoạt động
              </button>
            )}
          </div>
        </div>

        {/* Giải thưởng & Chứng nhận */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Giải thưởng & Chứng nhận
          </h4>
          <div className="space-y-2">
            {hasAchievements &&
              profile.achievements.map((ach, idx) => {
                const id = getAchievementId(ach);
                const text = getAchievementText(ach);
                const isEditing = id && editingAchId === id;
                return (
                  <div
                    key={id || idx}
                    className="flex items-start gap-2 p-2.5 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <GraduationCap className="text-primary mt-0.5 shrink-0" size={14} />
                    {isEditing ? (
                      <div className="flex-1 flex gap-1 flex-wrap">
                        <input
                          value={editAchText}
                          onChange={(e) => setEditAchText(e.target.value)}
                          className="flex-1 min-w-0 text-sm bg-background border border-border rounded px-2 py-1"
                        />
                        <button type="button" onClick={saveAch} className="p-1.5 rounded bg-primary text-primary-foreground">
                          <Check size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAchId(null);
                            setEditAchText("");
                          }}
                          className="p-1.5 rounded bg-muted text-muted-foreground"
                        >
                          <X size={12} />
                        </button>
                        {id && onDeleteAchievement && (
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteAchievement(id);
                              setEditingAchId(null);
                            }}
                            className="p-1.5 rounded text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        <span className="text-sm text-foreground flex-1 min-w-0 break-words">
                          {text}
                        </span>
                        {id && onUpdateAchievement && (
                          <button
                            type="button"
                            onClick={() => startEditAch(ach)}
                            className="p-1 rounded text-muted-foreground hover:bg-muted shrink-0"
                          >
                            <Pencil size={12} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            {addingAch && (
              <div className="flex gap-2 flex-wrap items-center p-2.5 rounded-lg border border-dashed border-border">
                <input
                  value={newAch.text}
                  onChange={(e) => setNewAch((f) => ({ ...f, text: e.target.value }))}
                  className="flex-1 min-w-0 text-sm bg-background border border-border rounded px-2 py-1"
                  placeholder="Tên giải thưởng - Đơn vị"
                />
                <select
                  value={newAch.category}
                  onChange={(e) =>
                    setNewAch((f) => ({
                      ...f,
                      category: e.target.value as "academic" | "non_academic",
                    }))
                  }
                  className="text-xs bg-background border border-border rounded px-2 py-1"
                >
                  <option value="academic">Học thuật</option>
                  <option value="non_academic">Ngoại khóa</option>
                </select>
                <button type="button" onClick={addAch} className="p-1.5 rounded bg-primary text-primary-foreground text-xs">
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setAddingAch(false)}
                  className="p-1.5 rounded bg-muted text-muted-foreground text-xs"
                >
                  Hủy
                </button>
              </div>
            )}
            {!hasAchievements && !addingAch && (
              <p className="text-sm text-muted-foreground italic py-2">
                Chưa cập nhật thành tích
              </p>
            )}
            {onAddAchievement && (
              <button
                type="button"
                onClick={() => setAddingAch(true)}
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <Plus size={14} />
                Thêm thành tích
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
