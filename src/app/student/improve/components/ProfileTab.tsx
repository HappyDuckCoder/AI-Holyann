'use client';

import React from 'react';
import { UserCircle, Loader2, BarChart3, Wand2, Star, Target, Shield, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ProfileDataState } from '../types';
import { safeText } from '../utils';
import { FormattedText } from './FormattedText';
import { ModalSection, CollapsibleSection } from './ModalSections';

export interface ProfileTabProps {
  profileData: ProfileDataState | null;
  profileDataLoading: boolean;
  resultsLoading: boolean;
  profileAnalysis: Record<string, unknown> | null;
  profileEnhance: Record<string, unknown> | null;
  profileAnalysisLoading: boolean;
  profileEnhanceLoading: boolean;
  analysisRating: number | null;
  enhanceRating: number | null;
  onAnalysis: () => void;
  onEnhance: () => void;
  setDetailModal: (v: { title: string; content: React.ReactNode } | null) => void;
  saveRating: (kind: 'analysis' | 'enhance', value: number) => void;
}

export function ProfileTab({
  profileData,
  profileDataLoading,
  resultsLoading,
  profileAnalysis,
  profileEnhance,
  profileAnalysisLoading,
  profileEnhanceLoading,
  analysisRating,
  enhanceRating,
  onAnalysis,
  onEnhance,
  setDetailModal,
  saveRating,
}: ProfileTabProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-primary" />
          Profile của bạn
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Dữ liệu từ phân tích hồ sơ, bài test và gợi ý trường. Dùng để Phân tích hoặc Đề xuất cải thiện bên dưới.
        </p>

        {profileDataLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            Đang tải thông tin profile...
          </div>
        ) : profileData ? (
          <div className="space-y-8">
            {profileData.feature1_output?.summary?.total_pillar_scores && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-4">4 trụ điểm (từ phân tích hồ sơ)</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { key: 'aca', label: 'Học thuật' },
                    { key: 'lan', label: 'Ngôn ngữ' },
                    { key: 'hdnk', label: 'Hoạt động' },
                    { key: 'skill', label: 'Kỹ năng' },
                  ].map(({ key, label }) => {
                    const score = profileData.feature1_output?.summary?.total_pillar_scores?.[key];
                    return (
                      <div key={key} className="rounded-2xl border border-border/60 bg-muted/20 p-5">
                        <p className="text-sm text-muted-foreground mb-1">{label}</p>
                        <p className="text-xl font-semibold text-primary">{score != null ? Number(score) : '—'}</p>
                      </div>
                    );
                  })}
                </div>
                {(profileData.feature1_output.summary.main_spike || profileData.feature1_output.summary.sharpness) && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Spike: {profileData.feature1_output.summary.main_spike ?? '—'} · Mức: {profileData.feature1_output.summary.sharpness ?? '—'}
                  </p>
                )}
              </div>
            )}
            {profileData.feature2_output?.assessment && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-4">Bài test (MBTI, Grit, RIASEC)</p>
                <div className="flex flex-wrap gap-4">
                  {profileData.feature2_output.assessment.mbti?.personality_type && (
                    <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-3">
                      <span className="text-sm text-muted-foreground">MBTI </span>
                      <span className="text-base font-medium text-foreground">{profileData.feature2_output.assessment.mbti.personality_type}</span>
                    </div>
                  )}
                  {(profileData.feature2_output.assessment.grit?.score != null || profileData.feature2_output.assessment.grit?.level) && (
                    <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-3">
                      <span className="text-sm text-muted-foreground">Grit </span>
                      <span className="text-base font-medium text-foreground">
                        {profileData.feature2_output.assessment.grit?.score ?? '—'} ({profileData.feature2_output.assessment.grit?.level ?? ''})
                      </span>
                    </div>
                  )}
                  {profileData.feature2_output.assessment.riasec?.code && (
                    <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-3">
                      <span className="text-sm text-muted-foreground">RIASEC </span>
                      <span className="text-base font-medium text-foreground">{profileData.feature2_output.assessment.riasec.code}</span>
                    </div>
                  )}
                  {!profileData.feature2_output.assessment.mbti?.personality_type &&
                    !profileData.feature2_output.assessment.grit?.score &&
                    !profileData.feature2_output.assessment.riasec?.code && (
                      <p className="text-sm text-muted-foreground">Chưa có kết quả test (làm bài test trong trang đánh giá).</p>
                    )}
                </div>
              </div>
            )}
            {profileData.feature3_output && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-4">Gợi ý trường (Module 3)</p>
                {profileData.feature3_output.universities && typeof profileData.feature3_output.universities === 'object' && Object.keys(profileData.feature3_output.universities as object).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                      { key: 'REACH' as const, label: 'Reach', Icon: Star },
                      { key: 'MATCH' as const, label: 'Match', Icon: Target },
                      { key: 'SAFETY' as const, label: 'Safety', Icon: Shield },
                    ].map(({ key, label, Icon }) => {
                      const block = profileData.feature3_output?.universities?.[key];
                      const list = block?.universities ?? [];
                      return (
                        <div key={key} className="rounded-2xl border border-border/60 bg-muted/20 overflow-hidden border-l-4 border-l-primary">
                          <div className="flex items-center gap-3 px-5 py-4 bg-card/80 border-b border-border/60">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <span className="text-base font-semibold text-foreground">{label}</span>
                              <p className="text-xs text-muted-foreground">{list.length} trường</p>
                            </div>
                          </div>
                          <ul className="p-5 space-y-3 max-h-44 overflow-y-auto">
                            {list.length === 0 ? (
                              <li className="text-sm text-muted-foreground py-2">—</li>
                            ) : (
                              list.map((uni, i) => (
                                <li key={uni.id ?? i} className="text-sm text-foreground" title={[uni.name, uni.country].filter(Boolean).join(' · ')}>
                                  <span className="font-medium">{uni.name}</span>
                                  {(uni.country || uni.ranking != null) && (
                                    <span className="text-muted-foreground block text-xs mt-0.5">
                                      {[uni.country, uni.ranking != null ? `#${uni.ranking}` : null].filter(Boolean).join(' · ')}
                                    </span>
                                  )}
                                </li>
                              ))
                            )}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa có gợi ý trường. Hoàn thành gợi ý trường để dữ liệu đầy đủ hơn.</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-6">
            <p className="text-sm text-muted-foreground">Chưa có dữ liệu. Hoàn thành phân tích hồ sơ và bài test (MBTI, Grit, RIASEC) để xem thông tin profile tại đây.</p>
          </div>
        )}

        {resultsLoading && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải kết quả đã lưu...
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4 pt-8 mt-8 border-t border-border/60">
          <span className="text-sm text-muted-foreground">Hành động:</span>
          <button
            type="button"
            onClick={onAnalysis}
            disabled={profileAnalysisLoading || profileEnhanceLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/60 bg-card text-foreground text-sm font-medium hover:bg-muted/50 hover:border-primary/40 transition-colors disabled:opacity-50"
          >
            {profileAnalysisLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <BarChart3 className="h-4 w-4 text-primary" />}
            {profileAnalysis ? 'Phân tích lại' : 'Phân tích profile'}
          </button>
          <button
            type="button"
            onClick={onEnhance}
            disabled={profileEnhanceLoading || profileAnalysisLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/60 bg-card text-foreground text-sm font-medium hover:bg-muted/50 hover:border-primary/40 transition-colors disabled:opacity-50"
          >
            {profileEnhanceLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Wand2 className="h-4 w-4 text-primary" />}
            {profileEnhance ? 'Cải thiện lại' : 'Đề xuất cải thiện'}
          </button>
        </div>
        {(profileAnalysisLoading || profileEnhanceLoading) && (
          <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            {profileAnalysisLoading ? 'Đang phân tích profile...' : 'Đang tạo đề xuất cải thiện...'} Có thể mất 1–2 phút, vui lòng không đóng trang.
          </p>
        )}
      </div>

      {profileAnalysis && typeof profileAnalysis === 'object' && (() => {
        const scores = (profileAnalysis.pillar_scores && typeof profileAnalysis.pillar_scores === 'object'
          ? profileAnalysis.pillar_scores
          : (profileAnalysis.feature1_output as Record<string, unknown>)?.summary && typeof (profileAnalysis.feature1_output as Record<string, unknown>).summary === 'object'
            ? ((profileAnalysis.feature1_output as Record<string, unknown>).summary as Record<string, unknown>).total_pillar_scores
            : null) as Record<string, number> | null;
        const pillarLabels: Record<string, string> = { aca: 'Học thuật', lan: 'Ngôn ngữ', hdnk: 'Hoạt động', skill: 'Kỹ năng' };
        const overallFeedback = profileAnalysis.overall && typeof profileAnalysis.overall === 'object'
          ? String(safeText((profileAnalysis.overall as { feedback?: unknown }).feedback) || safeText((profileAnalysis.overall as { summary?: unknown }).summary) || '')
          : '';
        const openAnalysisDetail = () => {
          const overall = profileAnalysis.overall && typeof profileAnalysis.overall === 'object' ? profileAnalysis.overall as Record<string, unknown> : null;
          setDetailModal({
            title: 'Kết quả phân tích',
            content: (
              <div className="space-y-4">
                {overall && overall.overall_score != null && (
                  <ModalSection title="Điểm tổng quát" accent="violet">
                    <p className="text-lg font-semibold text-violet-600 dark:text-violet-400">{Number(overall.overall_score)}/100</p>
                    {(overall.personal_fit_score != null) && <p className="text-sm text-muted-foreground mt-1">Phù hợp bản thân: {Number(overall.personal_fit_score)}/100</p>}
                  </ModalSection>
                )}
                {overall && (safeText(overall.feedback) || safeText(overall.summary) || safeText(overall.personal_fit_feedback)) && (
                  <CollapsibleSection title="Nhận xét & phù hợp" summary="Bấm để xem" accent="violet">
                    {(safeText(overall.feedback) || safeText(overall.summary)) && <FormattedText text={safeText(overall.feedback) || safeText(overall.summary)} />}
                    {safeText(overall.personal_fit_feedback) && <div className="mt-3 pt-3 border-t border-border/60"><FormattedText text={safeText(overall.personal_fit_feedback)} /></div>}
                  </CollapsibleSection>
                )}
                {Boolean(scores && Object.keys(scores).length > 0 && profileAnalysis.pillars && typeof profileAnalysis.pillars === 'object') && (
                  <CollapsibleSection title="Chi tiết từng trụ cột" summary="4 trụ · bấm để xem" accent="emerald">
                    <div className="space-y-3">
                      {['aca', 'lan', 'hdnk', 'skill'].map((key) => {
                        const data = (profileAnalysis.pillars as Record<string, unknown>)[key];
                        if (!data || typeof data !== 'object') return null;
                        const d = data as Record<string, unknown>;
                        const score = typeof d.score === 'number' ? d.score : scores?.[key];
                        const feedback = safeText(d.feedback);
                        const strengths = Array.isArray(d.strengths) ? d.strengths : [];
                        const weaknesses = Array.isArray(d.weaknesses) ? d.weaknesses : [];
                        const suggestions = Array.isArray(d.suggestions) ? d.suggestions : [];
                        return (
                          <div key={key} className="rounded-lg border border-border/40 bg-background/60 p-3">
                            <p className="text-sm font-semibold text-foreground">{pillarLabels[key]} — <span className="text-emerald-600 dark:text-emerald-400">{score != null ? Number(score) : '—'}/100</span></p>
                            {feedback ? <FormattedText text={feedback} className="mt-2" /> : null}
                            {strengths.length > 0 && <p className="text-xs text-muted-foreground mt-2">Điểm mạnh: {strengths.map((s: unknown) => safeText(s)).join(' • ')}</p>}
                            {weaknesses.length > 0 && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">Điểm yếu: {weaknesses.map((w: unknown) => safeText(w)).join(' • ')}</p>}
                            {suggestions.length > 0 && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Gợi ý: {suggestions.map((g: unknown) => safeText(g)).join(' • ')}</p>}
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleSection>
                )}
                {overall && Array.isArray(overall.priority_suggestions) && overall.priority_suggestions.length > 0 && (
                  <CollapsibleSection title="Gợi ý ưu tiên" summary={`${overall.priority_suggestions.length} mục`} accent="amber">
                    <ol className="text-sm text-foreground space-y-1 list-decimal list-inside">
                      {(overall.priority_suggestions as unknown[]).map((p, i) => <li key={i}>{safeText(p)}</li>)}
                    </ol>
                  </CollapsibleSection>
                )}
              </div>
            ),
          });
        };
        return (
          <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-base font-semibold text-foreground">Kết quả phân tích</h3>
                <button type="button" onClick={openAnalysisDetail} className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
                  Xem chi tiết <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {scores && Object.keys(scores).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['aca', 'lan', 'hdnk', 'skill'].map((key) => (
                    <div key={key} className="rounded-xl border border-border/60 bg-muted/20 p-4">
                      <p className="text-xs text-muted-foreground">{pillarLabels[key] || key}</p>
                      <p className="text-lg font-semibold text-primary mt-0.5">{scores[key] != null ? Number(scores[key]) : '—'}</p>
                    </div>
                  ))}
                </div>
              )}
              {overallFeedback && (
                <p className="text-sm text-muted-foreground line-clamp-2">{overallFeedback}</p>
              )}
              <div className="pt-2 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Đánh giá:</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => saveRating('analysis', n)} className="p-0.5 rounded hover:bg-muted/50" title={`${n} sao`}>
                    <Star className={cn('h-4 w-4', analysisRating != null && n <= analysisRating ? 'fill-primary text-primary' : 'text-muted-foreground')} />
                  </button>
                ))}
                {analysisRating != null && <span className="text-xs text-muted-foreground">{analysisRating}/5</span>}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {profileEnhance && typeof profileEnhance === 'object' && (() => {
        const recs = Array.isArray(profileEnhance.recommendations) ? (profileEnhance.recommendations as Record<string, unknown>[]) : [];
        const openEnhanceDetail = () => {
          setDetailModal({
            title: 'Đề xuất cải thiện',
            content: (
              <div className="space-y-4">
                {recs.length > 0 && (
                  <CollapsibleSection title="Khuyến nghị" summary={`${recs.length} mục · bấm để xem`} accent="sky">
                    <ul className="space-y-3">
                      {recs.map((r, i) => {
                        const name = safeText(r.specific_rec_name);
                        const reason = safeText(r.reason);
                        const actionPlan = Array.isArray(r.action_plan_details) ? (r.action_plan_details as unknown[]).map((a) => safeText(a)) : [];
                        const resourceLink = safeText(r.resource_link);
                        const estimatedTime = safeText(r.estimated_time);
                        return (
                          <li key={i} className="rounded-lg border border-border/40 bg-background/60 p-3">
                            <p className="font-medium text-sky-700 dark:text-sky-300">{name || `#${i + 1}`}</p>
                            {reason && <FormattedText text={reason} className="mt-2 text-sm" />}
                            {actionPlan.filter(Boolean).length > 0 && (
                              <ul className="text-sm text-foreground mt-2 list-disc list-inside space-y-0.5">
                                {actionPlan.filter(Boolean).map((step, j) => <li key={j}>{step}</li>)}
                              </ul>
                            )}
                            {(resourceLink || estimatedTime) && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {resourceLink ? <a href={resourceLink} target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 underline">Tài liệu</a> : null}
                                {resourceLink && estimatedTime ? ' · ' : null}
                                {estimatedTime ? `Ước tính: ${estimatedTime}` : null}
                              </p>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </CollapsibleSection>
                )}
                {Array.isArray(profileEnhance.improvements) && profileEnhance.improvements.length > 0 && (
                  <CollapsibleSection title="Cải thiện theo trụ cột" summary={`${profileEnhance.improvements.length} mục`} accent="amber">
                    <ul className="space-y-1 text-sm">
                      {(profileEnhance.improvements as Record<string, unknown>[]).map((imp, i) => (
                        <li key={i}><span className="text-amber-700 dark:text-amber-300 font-medium">{safeText(imp.pillar)}</span>: {safeText(imp.current_score)} → {safeText(imp.target_score)}{safeText(imp.what_improved) ? ` — ${safeText(imp.what_improved)}` : ''}</li>
                      ))}
                    </ul>
                  </CollapsibleSection>
                )}
                {safeText(profileEnhance.enhanced_summary) && (
                  <CollapsibleSection title="Tóm tắt" summary="Bấm để xem" accent="violet">
                    <FormattedText text={safeText(profileEnhance.enhanced_summary)} />
                  </CollapsibleSection>
                )}
                {recs.length === 0 && !profileEnhance.enhanced_summary && (!Array.isArray(profileEnhance.improvements) || profileEnhance.improvements.length === 0) && (
                  <p className="text-sm text-muted-foreground">Nội dung đang cập nhật.</p>
                )}
              </div>
            ),
          });
        };
        const showRecs = recs.slice(0, 3);
        return (
          <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-base font-semibold text-foreground">Đề xuất cải thiện</h3>
                <button type="button" onClick={openEnhanceDetail} className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
                  Xem chi tiết <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {showRecs.length > 0 ? (
                <div className="space-y-2">
                  {showRecs.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-xl border border-border/60 bg-muted/20 p-3">
                      <Badge variant="secondary" className="shrink-0 text-xs">{safeText(r.priority) || `#${i + 1}`}</Badge>
                      <p className="text-sm text-foreground line-clamp-2">{safeText(r.specific_rec_name) || safeText(r.reason)}</p>
                    </div>
                  ))}
                  {recs.length > 3 && <p className="text-xs text-muted-foreground">+{recs.length - 3} khuyến nghị khác</p>}
                </div>
              ) : safeText(profileEnhance.enhanced_summary) ? (
                <p className="text-sm text-muted-foreground line-clamp-2">{safeText(profileEnhance.enhanced_summary)}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Đã nhận kết quả. Bấm Xem chi tiết để cập nhật.</p>
              )}
              <div className="pt-2 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Đánh giá:</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => saveRating('enhance', n)} className="p-0.5 rounded hover:bg-muted/50" title={`${n} sao`}>
                    <Star className={cn('h-4 w-4', enhanceRating != null && n <= enhanceRating ? 'fill-primary text-primary' : 'text-muted-foreground')} />
                  </button>
                ))}
                {enhanceRating != null && <span className="text-xs text-muted-foreground">{enhanceRating}/5</span>}
              </div>
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}
