"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { FileText, UploadCloud, Trash2, File, GraduationCap, Sparkles } from "lucide-react";
import { StudentProfile, DocumentType } from "../../../types";
import { StatusBadge } from "./StatusBadge";

interface DocumentsSectionProps {
  profile: StudentProfile;
  isComplete: boolean;
  onUploadDocument: (file: File, type: DocumentType) => void;
  onDeleteDocument: (id: string) => void;
}

const DOC_TYPES: { type: DocumentType; label: string }[] = [
  { type: "transcript", label: "Bảng điểm" },
  { type: "certificate", label: "Chứng chỉ" },
  { type: "letter", label: "Thư giới thiệu" },
  { type: "essay", label: "Bài luận" },
  { type: "other", label: "Khác" },
];

function getDocTypeName(type: DocumentType): string {
  return DOC_TYPES.find((d) => d.type === type)?.label ?? "Khác";
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  profile,
  isComplete,
  onUploadDocument,
  onDeleteDocument,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<DocumentType>("transcript");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onUploadDocument(e.target.files[0], selectedType);
      e.target.value = "";
    }
  };

  const triggerUpload = (type: DocumentType) => {
    setSelectedType(type);
    fileInputRef.current?.click();
  };

  return (
    <section className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
      />

      <div className="px-5 py-4 border-b border-border/60 flex flex-wrap items-center justify-between gap-3 bg-muted/30">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          Tài liệu đính kèm
        </h3>
        <StatusBadge isComplete={isComplete} />
      </div>

      <div className="p-5">
        <div className="flex flex-wrap gap-2 mb-4">
          {DOC_TYPES.map(({ type, label }) => (
            <button
              key={type}
              type="button"
              onClick={() => triggerUpload(type)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-border bg-background text-foreground hover:bg-muted transition-colors"
            >
              <UploadCloud size={14} />
              {label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-border/60 overflow-hidden">
          <table className="min-w-full divide-y divide-border/60">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tài liệu
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ngày
                </th>
                <th className="relative px-4 py-2.5 w-10">
                  <span className="sr-only">Xóa</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-card">
              {profile.documents.length > 0 ? (
                profile.documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground">
                          <File size={14} />
                        </div>
                        <span className="text-sm font-medium text-foreground truncate max-w-[180px]">
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted text-foreground">
                        {getDocTypeName(doc.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {doc.uploadDate}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onDeleteDocument(doc.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    Chưa có tài liệu. Chọn loại phía trên để tải lên.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-4 border-t border-border/60 flex flex-wrap gap-2 text-sm">
          <Link
            href="/student/profile/schools"
            className="inline-flex items-center gap-1.5 text-primary hover:underline"
          >
            <GraduationCap size={14} />
            Trường mục tiêu
          </Link>
          <span className="text-border">|</span>
          <Link
            href="/student/profile/improve"
            className="inline-flex items-center gap-1.5 text-primary hover:underline"
          >
            <Sparkles size={14} />
            Cải thiện hồ sơ
          </Link>
        </div>
      </div>
    </section>
  );
};
