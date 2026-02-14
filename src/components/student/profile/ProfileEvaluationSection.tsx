'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { ProfileAnalysisContent, type AnalysisResult } from './ProfileAnalysisContent';

interface ProfileEvaluationSectionProps {
  analysisResult: AnalysisResult | null;
  analysisLoading: boolean;
  onAnalyze: () => void;
}

export function ProfileEvaluationSection({
  analysisResult,
  analysisLoading,
  onAnalyze,
}: ProfileEvaluationSectionProps) {
  const hasResult = analysisResult?.data != null;
  const hasError = analysisResult?.error != null || (!analysisResult?.data && analysisResult != null);

  return (
    <div className="rounded-2xl border border-border shadow-sm overflow-hidden border-l-4 border-l-indigo-500/60 bg-card bg-gradient-to-br from-indigo-500/5 to-transparent">
      <div className="px-5 py-4 border-b border-border bg-indigo-500/5 flex flex-row items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 shrink-0">
          <Sparkles className="size-4" aria-hidden />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground m-0">Đánh giá profile</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Phân tích AI điểm mạnh, điểm yếu, spike và khu vực phù hợp
          </p>
        </div>
      </div>
      <div className="p-5">
      {!hasResult && !analysisLoading && !hasError && (
        <div className="rounded-xl border border-border/60 bg-muted/30 p-6 flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground text-sm max-w-sm mb-5">
            Chạy phân tích AI để xem đánh giá chi tiết về điểm mạnh, điểm yếu, spike và gợi ý khu vực du học.
          </p>
          <button
            type="button"
            onClick={onAnalyze}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors border-0"
          >
            <Sparkles size={16} />
            Phân tích hồ sơ
          </button>
        </div>
      )}
      {(analysisLoading || hasResult || hasError) && (
        <ProfileAnalysisContent
          result={analysisResult}
          loading={analysisLoading}
          onRetry={onAnalyze}
        />
      )}
      {hasResult && !analysisLoading && (
        <div className="mt-4 pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={onAnalyze}
            className="text-sm font-medium text-primary hover:underline"
          >
            Phân tích lại
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
