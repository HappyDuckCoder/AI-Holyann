"use client";

import React, { useRef, useState } from "react";
import { FileText, UploadCloud, Trash2, File, Loader2 } from "lucide-react";
import { StudentProfile, DocumentType } from "../../../types";
import { StatusBadge } from "./StatusBadge";

interface DocumentsSectionProps {
  profile: StudentProfile;
  isComplete: boolean;
  onUploadDocument: (file: File, type: DocumentType) => void;
  onDeleteDocument: (id: string) => void;
  uploadDocumentLoading?: boolean;
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
  uploadDocumentLoading = false,
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
    <section className="rounded-2xl border border-border shadow-sm overflow-hidden border-l-4 border-l-sky-500/60 bg-card bg-gradient-to-br from-sky-500/5 to-transparent">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
      />

      <div className="px-5 py-4 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-sky-500/5">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/20 text-sky-700 dark:text-sky-400 shrink-0">
            <FileText size={18} className="size-4" aria-hidden />
          </span>
          Tài liệu đính kèm
        </h3>
        <StatusBadge isComplete={isComplete} />
      </div>

      <div className="p-5 relative">
        {uploadDocumentLoading && (
          <div className="absolute inset-0 bg-background/80 z-10 flex items-center justify-center rounded-b-2xl">
            <div className="flex flex-col items-center gap-2 text-primary">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm font-medium">Đang tải lên...</span>
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          {DOC_TYPES.map(({ type, label }) => (
            <button
              key={type}
              type="button"
              disabled={uploadDocumentLoading}
              onClick={() => triggerUpload(type)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-border bg-background text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
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
      </div>
    </section>
  );
};
