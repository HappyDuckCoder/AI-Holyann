'use client';

import React, { useState, useRef } from 'react';
import { StudentPageContainer } from '@/components/student';
import { FileText, PenLine, Upload, Sparkles, Bold, Italic, List, ListOrdered, AlignLeft } from 'lucide-react';

type TabId = 'cv' | 'essay';

export default function ImprovePage() {
  const [activeTab, setActiveTab] = useState<TabId>('cv');
  const [essayContent, setEssayContent] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'cv', label: 'CV', icon: <FileText className="h-4 w-4" /> },
    { id: 'essay', label: 'Luận', icon: <PenLine className="h-4 w-4" /> },
  ];

  const execCommand = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  return (
    <StudentPageContainer>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            Improve
          </h1>
          <p className="text-muted-foreground mt-1">Nâng cao CV và bài luận của bạn.</p>
        </div>

        {/* Tabs */}
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="flex border-b border-border/60 bg-muted/30">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary bg-card text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 min-h-[480px]">
            {activeTab === 'cv' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-6">
                  <h3 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Upload className="h-4 w-4 text-primary" />
                    Tải lên hoặc cải thiện CV
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Kéo thả file CV (PDF/Word) vào đây hoặc dán nội dung để nhận gợi ý chỉnh sửa.
                  </p>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-muted/30 transition-colors">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">Kéo thả file vào đây hoặc click để chọn</p>
                    <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (tối đa 5MB)</p>
                  </div>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Gợi ý cải thiện CV</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Sử dụng động từ mạnh (Led, Developed, Achieved) cho từng mục.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Thêm số liệu cụ thể (%, số người, quy mô dự án).
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Ưu tiên thông tin liên quan đến ngành và trường mục tiêu.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'essay' && (
              <div className="flex flex-col h-[520px]">
                {/* Toolbar - Google Doc style */}
                <div className="flex flex-wrap items-center gap-1 p-2 border border-border/60 rounded-t-xl bg-muted/30 border-b-0">
                  <button
                    type="button"
                    onClick={() => execCommand('bold')}
                    className="p-2 rounded hover:bg-muted text-foreground"
                    title="Đậm"
                  >
                    <Bold className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execCommand('italic')}
                    className="p-2 rounded hover:bg-muted text-foreground"
                    title="Nghiêng"
                  >
                    <Italic className="h-4 w-4" />
                  </button>
                  <span className="w-px h-5 bg-border mx-1" />
                  <button
                    type="button"
                    onClick={() => execCommand('insertUnorderedList')}
                    className="p-2 rounded hover:bg-muted text-foreground"
                    title="Danh sách"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execCommand('insertOrderedList')}
                    className="p-2 rounded hover:bg-muted text-foreground"
                    title="Đánh số"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execCommand('justifyLeft')}
                    className="p-2 rounded hover:bg-muted text-foreground"
                    title="Căn trái"
                  >
                    <AlignLeft className="h-4 w-4" />
                  </button>
                </div>
                {/* Editor area - Google Doc style */}
                <div className="relative flex-1 min-h-[400px]">
                  {!essayContent.trim() && (
                    <div
                      className="absolute inset-0 p-6 pt-8 pointer-events-none text-muted-foreground text-base leading-relaxed"
                      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                    >
                      Bắt đầu viết bài luận của bạn...
                    </div>
                  )}
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="relative w-full h-full min-h-[400px] p-6 pt-8 border border-border/60 rounded-b-xl bg-background text-foreground text-base leading-relaxed overflow-y-auto focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-inset"
                    style={{
                      fontFamily: 'Georgia, "Times New Roman", serif',
                    }}
                    onInput={(e) => setEssayContent((e.target as HTMLDivElement).innerHTML)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentPageContainer>
  );
}
