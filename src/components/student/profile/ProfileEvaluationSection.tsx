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
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted border border-border/60">
            <Sparkles className="h-4 w-4 text-foreground/80" />
          </span>
          Đánh giá profile
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Phân tích AI điểm mạnh, điểm yếu, spike và khu vực phù hợp
        </p>
      </div>
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
  );
}
