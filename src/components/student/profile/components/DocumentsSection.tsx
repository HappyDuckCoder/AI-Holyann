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

      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-sky-500/5 transition-colors duration-300">
        <h3 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
          <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-sky-500/20 text-sky-700 dark:text-sky-400 shrink-0">
            <FileText size={18} className="size-4" aria-hidden />
          </span>
          Tài liệu đính kèm
        </h3>
        <StatusBadge isComplete={isComplete} />
      </div>

      <div className="p-4 sm:p-5 relative">
        {uploadDocumentLoading && (
          <div className="absolute inset-0 bg-background/90 z-10 flex items-center justify-center rounded-b-2xl transition-colors duration-300">
            <div className="flex flex-col items-center gap-2 text-primary">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm font-medium text-foreground">Đang tải lên...</span>
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
          {DOC_TYPES.map(({ type, label }) => (
            <button
              key={type}
              type="button"
              disabled={uploadDocumentLoading}
              onClick={() => triggerUpload(type)}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium border border-border bg-card text-foreground hover:bg-muted transition-colors duration-300 disabled:bg-muted disabled:opacity-60 disabled:pointer-events-none"
            >
              <UploadCloud size={12} className="sm:w-3.5 sm:h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Mobile: Card view */}
        <div className="block sm:hidden space-y-3">
          {profile.documents.length > 0 ? (
            profile.documents.map((doc) => (
              <div key={doc.id} className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between gap-3 transition-colors duration-300">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                    <File size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{getDocTypeName(doc.type)} • {doc.uploadDate}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteDocument(doc.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Chưa có tài liệu. Chọn loại phía trên để tải lên.
            </div>
          )}
        </div>

        {/* Desktop: Table view */}
        <div className="hidden sm:block rounded-xl border border-border overflow-hidden">
          <table className="min-w-full divide-y divide-border">
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
            <tbody className="divide-y divide-border bg-card">
              {profile.documents.length > 0 ? (
                profile.documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/20 transition-colors duration-300">
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
