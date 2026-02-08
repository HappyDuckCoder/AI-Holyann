'use client';

import React from 'react';
import { ProfileAnalysisContent, type AnalysisResult } from './ProfileAnalysisContent';

interface ProfileAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnalysisResult | null;
  loading: boolean;
  onRetry?: () => void;
}

export default function ProfileAnalysisModal({
  isOpen,
  onClose,
  result,
  loading,
  onRetry,
}: ProfileAnalysisModalProps) {
  if (!isOpen) return null;

  const data = result?.data;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>🎯</span> Kết Quả Phân Tích Hồ Sơ AI
              </h2>
              {data?.summary && (
                <p className="text-white/80 text-sm mt-1">
                  Spike chính: <span className="font-semibold text-white">{data.summary.main_spike}</span>
                  {' • '}Độ sắc: <span className="font-semibold text-white">{data.summary.sharpness}</span>
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0 px-6">
          <ProfileAnalysisContent
            result={result}
            loading={loading}
            onRetry={onRetry ? () => { onClose(); onRetry(); } : undefined}
          />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Phân tích bởi AI • {new Date().toLocaleDateString('vi-VN')}
          </p>
          <div className="flex gap-3">
            {onRetry && (result?.error || (!data && !loading)) && (
              <button
                onClick={() => { onClose(); onRetry(); }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Thử lại
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg shadow-purple-500/25"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
