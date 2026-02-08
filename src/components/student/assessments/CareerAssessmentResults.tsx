"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { ONETDatasetInfo } from "./CareerAssessmentResults/ONETDatasetInfo";

// Component-specific interface (camelCase for React)
interface CareerRecommendation {
  name: string;
  category: string;
  matchReason: string;
  careerPaths: string[];
  requiredSkills: string[];
  matchPercentage: number;
  riasecCode?: string;
  riasecScores?: Record<string, number>;
}

// Component-specific career groups type
type ComponentCareerGroups = Record<string, CareerRecommendation[]>;

interface CareerAssessment {
  mbti: {
    personality_type: string;
    confidence: number;
    dimension_scores: Record<string, number>;
  };
  grit: {
    score: number;
    level: string;
    description: string;
  };
  riasec: {
    code: string;
    scores: Record<string, number>;
    top3: [string, number][];
  };
}

interface CareerAssessmentResultsProps {
  studentId: string;
  onClose: () => void;
  autoLoad?: boolean; // Tự động gọi API khi component mount
  refreshTrigger?: number; // Tăng khi bấm "Xem đề xuất nghề nghiệp" để gọi lại API
}

function CareerAssessmentResults({
  studentId,
  onClose,
  autoLoad = false,
  refreshTrigger = 0,
}: CareerAssessmentResultsProps) {
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<CareerAssessment | null>(null);
  const [recommendations, setRecommendations] = useState<
    CareerRecommendation[]
  >([]);
  const [careerGroups, setCareerGroups] =
    useState<ComponentCareerGroups | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Gọi API đề xuất nghề khi mount (autoLoad) hoặc khi user bấm "Xem đề xuất nghề nghiệp" (refreshTrigger tăng)
  useEffect(() => {
    if (!studentId) return;
    if (autoLoad) {
      handleGetRecommendations();
      return;
    }
    if (refreshTrigger > 0) {
      handleGetRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, autoLoad, refreshTrigger]);

  const handleGetRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🎯 Getting career recommendations for student:", studentId);

      // Call real API - Module 2
      const response = await fetch("/api/module2/career-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ student_id: studentId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `API returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Không thể lấy đề xuất nghề nghiệp");
      }

      setAssessment(data.assessment);

      // Transform recommendations từ API format (snake_case) sang component format (camelCase)
      const transformedRecs = (data.recommendations || []).map((rec: any) => ({
        name: rec.title || rec.name,
        category: rec.job_field || rec.category || "",
        matchReason: rec.description || rec.matchReason || "",
        careerPaths: [],
        requiredSkills: [],
        matchPercentage: Math.round(
          rec.match_score || rec.matchPercentage || 0
        ),
        riasecCode: rec.riasec_code || rec.riasecCode,
        riasecScores: rec.riasec_scores || rec.riasecScores,
      }));
      setRecommendations(transformedRecs);

      // Handle career_groups if available - transform từ API response
      if (data.career_groups && typeof data.career_groups === "object") {
        // Transform career_groups từ API format sang component format
        const transformedGroups: ComponentCareerGroups = {};
        for (const [groupName, groupRecs] of Object.entries(
          data.career_groups
        )) {
          transformedGroups[groupName] = (groupRecs as any[]).map(
            (rec: any) => ({
              name: rec.title || rec.name,
              category: groupName,
              matchReason: rec.description || rec.matchReason || "",
              careerPaths: [],
              requiredSkills: [],
              matchPercentage: Math.round(
                rec.match_score || rec.matchPercentage || 0
              ),
              riasecCode: rec.riasec_code || rec.riasecCode,
              riasecScores: rec.riasec_scores || rec.riasecScores,
            })
          );
        }
        setCareerGroups(transformedGroups);
        console.log(
          "✅ Career groups received:",
          Object.keys(transformedGroups).length,
          "groups"
        );
      } else if (transformedRecs.length > 0) {
        // Nếu không có career_groups nhưng có recommendations, group theo category nếu có
        const groups: ComponentCareerGroups = {};
        transformedRecs.forEach((rec: any) => {
          const groupName = rec.category || "Khác";
          if (!groups[groupName]) {
            groups[groupName] = [];
          }
          groups[groupName].push(rec);
        });
        if (Object.keys(groups).length > 0) {
          setCareerGroups(groups);
        } else {
          setCareerGroups(null);
        }
      } else {
        setCareerGroups(null);
      }

      if (data.note) {
        console.log("ℹ️ Note:", data.note);
      }

      console.log(
        "✅ Career recommendations received:",
        data.recommendations?.length || 0
      );
    } catch (error: any) {
      console.error("❌ Career assessment error:", error);

      // Parse error message để hiển thị gần gũi hơn
      let errorMessage = "Đã xảy ra lỗi khi lấy đề xuất nghề nghiệp";
      let errorDescription = "Vui lòng thử lại sau";

      if (error.message) {
        const msg = error.message.toLowerCase();
        if (
          msg.includes("cannot connect") ||
          msg.includes("503") ||
          msg.includes("unavailable")
        ) {
          errorMessage = "Không thể kết nối đến dịch vụ phân tích";
          errorDescription = "Vui lòng kiểm tra kết nối mạng và thử lại sau";
        } else if (msg.includes("missing") || msg.includes("complete")) {
          errorMessage = "Chưa hoàn thành đủ bài test";
          errorDescription =
            "Vui lòng hoàn thành tất cả 3 bài test (MBTI, RIASEC, GRIT) trước";
        } else if (
          msg.includes("database") ||
          msg.includes("column") ||
          msg.includes("job_field")
        ) {
          errorMessage = "Lỗi cấu hình hệ thống";
          errorDescription = "Vui lòng liên hệ quản trị viên để được hỗ trợ";
        } else {
          errorDescription = error.message;
        }
      }

      setError(errorMessage);

      // Hiển thị toast notification
      toast.error(errorMessage, {
        description: errorDescription,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "text-primary bg-primary/10";
    if (percentage >= 60) return "text-primary bg-primary/10";
    if (percentage >= 40) return "text-foreground bg-muted/50";
    return "text-muted-foreground bg-muted/30";
  };

  const getRIASECDescription = (code: string) => {
    const descriptions: Record<string, string> = {
      R: "Realistic - Thực tế",
      I: "Investigative - Nghiên cứu",
      A: "Artistic - Nghệ thuật",
      S: "Social - Xã hội",
      E: "Enterprising - Doanh nghiệp",
      C: "Conventional - Truyền thống",
    };
    return code
      .split("")
      .map((c) => descriptions[c] || c)
      .join(" + ");
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-8 mt-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground mb-1">
              Đang phân tích nghề nghiệp phù hợp
            </p>
            <p className="text-sm text-muted-foreground">
              AI đang phân tích kết quả test của bạn...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!recommendations.length && !error) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-8 mt-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">
            🎯 Khám phá nghề nghiệp phù hợp
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Dựa trên kết quả 3 bài test, chúng tôi sẽ đề xuất những nghề nghiệp
            phù hợp nhất với bạn
          </p>
          <button
            onClick={handleGetRecommendations}
            disabled={loading}
            className="bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                <span>Đang phân tích...</span>
              </div>
            ) : (
              "Xem đề xuất nghề nghiệp"
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive px-6 py-4 rounded-xl">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span className="font-semibold">Lỗi:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {assessment && (
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-foreground">
              📊 Tổng hợp kết quả đánh giá
            </h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              {showDetails ? "Ẩn chi tiết" : "Xem chi tiết"}
              <svg
                className={`w-4 h-4 transition-transform ${showDetails ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">MBTI</div>
              <div className="text-2xl font-bold text-primary mt-1">
                {assessment.mbti.personality_type}
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">
                Độ tin cậy: {(assessment.mbti.confidence * 100).toFixed(1)}%
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">GRIT</div>
              <div className="text-2xl font-bold text-primary mt-1">
                {assessment.grit.score.toFixed(2)}/5.0
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">
                {assessment.grit.level}
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">RIASEC</div>
              <div className="text-2xl font-bold text-primary mt-1">
                {assessment.riasec.code}
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">
                {getRIASECDescription(assessment.riasec.code)}
              </div>
            </div>
          </div>

          {showDetails && (
            <div className="mt-5 pt-5 border-t border-border/60 space-y-6">
              {/* MBTI 4 dimensions với thanh tiến trình */}
              <div className="rounded-xl border border-border/60 bg-muted/10 p-5">
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="text-primary">MBTI</span> — Các chiều tính cách
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { a: "E", b: "I", labelA: "Hướng ngoại", labelB: "Hướng nội" },
                    { a: "S", b: "N", labelA: "Giác quan", labelB: "Trực giác" },
                    { a: "T", b: "F", labelA: "Lý trí", labelB: "Cảm xúc" },
                    { a: "J", b: "P", labelA: "Nguyên tắc", labelB: "Linh hoạt" },
                  ].map(({ a, b }) => {
                    const scores = assessment.mbti.dimension_scores;
                    const va = typeof scores[a] === "number" ? scores[a] : 0;
                    const vb = typeof scores[b] === "number" ? scores[b] : 0;
                    const total = va + vb || 1;
                    const pctA = Math.round((va / total) * 100);
                    return (
                      <div key={`${a}/${b}`}>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                          <span>{a}</span>
                          <span>{b}</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-muted overflow-hidden flex">
                          <div
                            className="h-full bg-primary rounded-l-full transition-all"
                            style={{ width: `${pctA}%` }}
                          />
                          <div
                            className="h-full bg-primary/40 rounded-r-full transition-all"
                            style={{ width: `${100 - pctA}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-xs font-medium text-foreground">
                          <span>{pctA}%</span>
                          <span>{100 - pctA}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* GRIT mô tả */}
              {assessment.grit.description && (
                <div className="rounded-xl border border-border/60 bg-muted/10 p-5">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="text-primary">GRIT</span> — Mức độ kiên trì & đam mê
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {assessment.grit.description}
                  </p>
                </div>
              )}

              {/* RIASEC 6 chiều + Top 3 */}
              <div className="rounded-xl border border-border/60 bg-muted/10 p-5">
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="text-primary">Holland (RIASEC)</span> — Xu hướng nghề nghiệp
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                  {["R", "I", "A", "S", "E", "C"].map((code) => {
                    const score = assessment.riasec.scores?.[code] ?? 0;
                    const maxScore = Math.max(
                      ...Object.values(assessment.riasec.scores || {}),
                      1
                    );
                    const pct = maxScore ? (score / maxScore) * 100 : 0;
                    const isTop3 = assessment.riasec.top3.some(([c]) => c === code);
                    return (
                      <div
                        key={code}
                        className={`rounded-lg border p-3 text-center ${isTop3 ? "border-primary bg-primary/10" : "border-border/60 bg-muted/20"}`}
                      >
                        <div className="text-xs font-semibold text-muted-foreground mb-1">
                          {code}
                        </div>
                        <div className="text-lg font-bold text-foreground">
                          {typeof score === "number" ? score.toFixed(1) : score}
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-3 border-t border-border/60">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Top 3 xu hướng:</p>
                  <div className="flex flex-wrap gap-2">
                    {assessment.riasec.top3.map(([category, score], index) => (
                      <span
                        key={category}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-sm font-medium"
                      >
                        <span className="text-muted-foreground">{index + 1}.</span>
                        {category}
                        <span className="text-muted-foreground">({score})</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-foreground">
              🎯 Đề xuất nghề nghiệp ({recommendations.length} nghề)
            </h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/50"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* O*NET Dataset Information */}
          <ONETDatasetInfo />

          {/* Display by career groups if available - Redesigned theo POSTMAN_TEST_OUTPUT.json */}
          {careerGroups && Object.keys(careerGroups).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(careerGroups).map(([groupName, groupRecs]) => (
                <div
                  key={groupName}
                  className="rounded-2xl border border-border/60 bg-muted/20 p-6"
                >
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/60">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-foreground">
                        {groupName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {groupRecs.length} nghề nghiệp phù hợp
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {groupRecs.map((rec, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-border/60 bg-card p-5 hover:shadow-md transition-all flex flex-col"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h5 className="font-bold text-lg text-foreground mb-2">
                              {rec.name}
                            </h5>
                            {rec.category && (
                              <div className="mb-2">
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                    />
                                  </svg>
                                  {rec.category}
                                </span>
                              </div>
                            )}
                            {rec.riasecCode && (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                                  {rec.riasecCode}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {getRIASECDescription(rec.riasecCode)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div
                            className={`px-3 py-1.5 rounded-full text-sm font-bold ${getMatchColor(
                              rec.matchPercentage
                            )} whitespace-nowrap ml-2 shrink-0`}
                          >
                            {rec.matchPercentage}%
                          </div>
                        </div>

                        {rec.riasecScores && (
                          <div className="mt-auto pt-3 border-t border-border/60">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-semibold text-muted-foreground">
                                Điểm RIASEC
                              </p>
                            </div>
                            <div className="grid grid-cols-6 gap-1.5">
                              {Object.entries(rec.riasecScores).map(
                                ([code, score]) => (
                                  <div
                                    key={code}
                                    className="text-center rounded-lg p-1.5 border border-border/60 bg-muted/30"
                                  >
                                    <div className="text-xs font-bold text-foreground mb-0.5">
                                      {code}
                                    </div>
                                    <div className="text-xs font-semibold text-primary">
                                      {typeof score === "number"
                                        ? score.toFixed(1)
                                        : score}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-border/60 bg-card p-5 hover:shadow-md transition-all flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-foreground mb-2">
                        {rec.name}
                      </h4>
                      {rec.category && (
                        <div className="mb-2">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                              />
                            </svg>
                            {rec.category}
                          </span>
                        </div>
                      )}
                      {rec.riasecCode && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                            {rec.riasecCode}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {getRIASECDescription(rec.riasecCode)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-full text-sm font-bold ${getMatchColor(
                        rec.matchPercentage
                      )} whitespace-nowrap ml-2 shrink-0`}
                    >
                      {rec.matchPercentage}%
                    </div>
                  </div>

                  {rec.riasecScores && (
                    <div className="mt-auto pt-3 border-t border-border/60">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Điểm RIASEC
                        </p>
                      </div>
                      <div className="grid grid-cols-6 gap-1.5">
                        {Object.entries(rec.riasecScores).map(
                          ([code, score]) => (
                            <div
                              key={code}
                              className="text-center rounded-lg p-1.5 border border-border/60 bg-muted/30"
                            >
                              <div className="text-xs font-bold text-foreground mb-0.5">
                                {code}
                              </div>
                              <div className="text-xs font-semibold text-primary">
                                {typeof score === "number"
                                  ? score.toFixed(1)
                                  : score}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CareerAssessmentResults;
