"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { BarChart3, ArrowRight } from "lucide-react";
import { StudentPageContainer } from "@/components/student";
import { PageLoading } from "@/components/ui/PageLoading";
import { useAuthSession } from "@/hooks/useAuthSession";
import { OverviewPillarCard, type PillarScores } from "@/components/student/profile/OverviewPillarCard";
import { ProfileEvaluationSection } from "@/components/student/profile/ProfileEvaluationSection";
import { StudentProfile } from "@/components/types";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const listItemVariant = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function ProfileAnalysisPage() {
  const { session, isLoading: sessionLoading, isAuthenticated } = useAuthSession();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const analysisInFlightRef = useRef(false);

  const studentId = useMemo(() => {
    const sessionUserId =
      (session?.user as any)?.id ||
      (session?.user as any)?.user_id ||
      (session?.user as any)?.sub;
    if (sessionUserId) return sessionUserId as string;
    const userEmail = session?.user?.email;
    if (userEmail && !sessionUserId) return `email:${userEmail}`;
    return null;
  }, [session?.user, sessionLoading, isAuthenticated]);

  /** Điểm 4 trụ từ kết quả Đánh giá profile; Đánh giá tổng quan chỉ dùng nguồn này. */
  const pillarScores: PillarScores | null = useMemo(() => {
    if (!analysisResult?.data) return null;
    const summary = analysisResult.data.summary;
    const total = summary?.total_pillar_scores;
    if (
      total &&
      typeof total.aca === "number" &&
      typeof total.lan === "number" &&
      typeof total.hdnk === "number" &&
      typeof total.skill === "number"
    ) {
      return {
        aca: total.aca,
        lan: total.lan,
        hdnk: total.hdnk,
        skill: total.skill,
      };
    }
    const sectionD = analysisResult.data["D. Điểm số gốc (Pillar Scores)"];
    if (sectionD && typeof sectionD === "object") {
      const d = sectionD as Record<string, unknown>;
      return {
        aca: Number(d["Học thuật (Aca)"]) || 0,
        lan: Number(d["Ngôn ngữ (Lan)"]) || 0,
        hdnk: Number(d["Hoạt động ngoại khóa (HDNK)"]) || 0,
        skill: Number(d["Kỹ năng (Skill)"]) || 0,
      };
    }
    return null;
  }, [analysisResult]);

  useEffect(() => {
    if (sessionLoading && !studentId) return;
    const hasAuth = isAuthenticated || studentId;
    if (!hasAuth) {
      setError("Vui lòng đăng nhập để xem đánh giá hồ sơ.");
      setLoading(false);
      return;
    }
    if (!studentId) {
      setError("Không tìm thấy thông tin học sinh.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        let actualStudentId = studentId;
        if (studentId.startsWith("email:")) {
          const email = studentId.substring(6);
          const userResponse = await fetch(
            `/api/users/by-email?email=${encodeURIComponent(email)}`
          );
          if (userResponse.ok) {
            const userData = await userResponse.json();
            actualStudentId = userData.id;
          } else {
            throw new Error("Không thể tìm thấy người dùng với email này");
          }
        }

        const response = await fetch(`/api/students/${actualStudentId}/profile`);
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Không thể tải thông tin học sinh");
        }

        const data = await response.json();
        const mappedProfile: StudentProfile = {
          id: actualStudentId.substring(0, 8).toUpperCase(),
          name: data.basicInfo.full_name || "Chưa cập nhật",
          email: data.basicInfo.email || "Chưa cập nhật",
          phone: data.basicInfo.phone_number || "Chưa cập nhật",
          address: data.basicInfo.current_address || "Chưa cập nhật",
          dob: data.basicInfo.date_of_birth
            ? new Date(data.basicInfo.date_of_birth).toLocaleDateString("vi-VN")
            : "Chưa cập nhật",
          avatarUrl: data.basicInfo.avatar_url || "",
          gpa: (() => {
            const gpaDetails = data.academicProfile?.gpa_transcript_details;
            if (!gpaDetails) return 0;
            if (gpaDetails.grade12) return parseFloat(gpaDetails.grade12) || 0;
            if (gpaDetails.grade11) return parseFloat(gpaDetails.grade11) || 0;
            return parseFloat(gpaDetails.grade10 || gpaDetails.grade9 || "0") || 0;
          })(),
          gpaScale: 10,
          englishCertificates: Array.isArray(data.academicProfile?.english_certificates)
            ? data.academicProfile.english_certificates.map((c: any) => ({
                type: c.type || "",
                score: String(c.score ?? ""),
              }))
            : [],
          englishLevel: (() => {
            const certs = data.academicProfile?.english_certificates;
            if (!Array.isArray(certs) || certs.length === 0) return "Chưa cập nhật";
            return certs
              .map((c: any) => `${c.type || ""} ${c.score ?? ""}`.trim())
              .filter(Boolean)
              .join(", ") || "Chưa cập nhật";
          })(),
          targetMajor: data.studentInfo?.intended_major || "Chưa xác định",
          targetCountry: data.studentInfo?.target_country || "Chưa xác định",
          extracurriculars: [
            ...(data.background?.academic_extracurriculars?.map((act: any) => ({
              id: act.id,
              title: act.activity_name || "Hoạt động",
              role: act.role || "Thành viên",
              year: act.start_date
                ? new Date(act.start_date).getFullYear().toString()
                : "—",
              description: act.description || "",
              category: "academic" as const,
            })) || []),
            ...(data.background?.non_academic_extracurriculars?.map((act: any) => ({
              id: act.id,
              title: act.activity_name || "Hoạt động",
              role: act.role || "Thành viên",
              year: act.start_date
                ? new Date(act.start_date).getFullYear().toString()
                : "—",
              description: act.description || "",
              category: "non_academic" as const,
            })) || []),
          ],
          achievements: [
            ...(data.background?.academic_awards?.map((award: any) => ({
              id: award.id,
              text: `${award.award_name} - ${award.issuing_organization || ""}`.trim(),
              category: "academic" as const,
            })) || []),
            ...(data.background?.non_academic_awards?.map((award: any) => ({
              id: award.id,
              text: `${award.award_name} - ${award.issuing_organization || ""}`.trim(),
              category: "non_academic" as const,
            })) || []),
          ],
          documents: [],
        };
        setProfile(mappedProfile);
        setError(null);

        // Load kết quả phân tích đã lưu từ DB (để xem lại khi quay lại trang)
        if (!actualStudentId.startsWith("email:")) {
          try {
            const analysisRes = await fetch(
              `/api/students/${actualStudentId}/analysis-history`
            );
            const analysisJson = await analysisRes.json();
            if (analysisJson.success && analysisJson.latest?.fullResult) {
              setAnalysisResult({ data: analysisJson.latest.fullResult });
            }
          } catch {
            // Bỏ qua nếu không load được lịch sử phân tích
          }
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải thông tin học sinh");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [studentId, sessionLoading, isAuthenticated]);

  const handleAnalyzeProfile = async () => {
    if (analysisInFlightRef.current || !studentId) return;
    if (studentId.startsWith("email:")) {
      toast.error("Vui lòng đăng nhập đầy đủ để phân tích hồ sơ.");
      return;
    }
    analysisInFlightRef.current = true;
    setAnalysisLoading(true);
    setAnalysisResult(null);
    toast.info("Đang phân tích hồ sơ", {
      description: "AI đang phân tích hồ sơ của bạn. Vui lòng đợi trong giây lát...",
    });
    try {
      const response = await fetch(`/api/students/${studentId}/analyze-profile`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        setAnalysisResult({
          error: data.error || "Có lỗi xảy ra khi phân tích hồ sơ",
        });
        toast.error("Phân tích hồ sơ thất bại", {
          description: data.error || "Vui lòng thử lại sau",
        });
      } else {
        setAnalysisResult(data);
        toast.success("Phân tích hồ sơ hoàn tất", {
          description: "Đã tạo báo cáo phân tích chi tiết cho hồ sơ của bạn",
        });
      }
    } catch {
      setAnalysisResult({
        error: "Có lỗi xảy ra khi kết nối đến server phân tích",
      });
      toast.error("Không thể kết nối đến server");
    } finally {
      analysisInFlightRef.current = false;
      setAnalysisLoading(false);
    }
  };

  if (loading || sessionLoading) {
    return (
      <StudentPageContainer>
        <PageLoading
          fullPage={false}
          message={sessionLoading ? 'Đang xác thực...' : 'Đang tải thông tin...'}
        />
      </StudentPageContainer>
    );
  }

  if (error || !profile) {
    return (
      <StudentPageContainer>
        <div className="flex flex-col justify-center items-center min-h-[60vh] px-4">
          <div className="max-w-md w-full bg-destructive/10 border border-destructive/30 rounded-xl p-6 text-center">
            <p className="text-destructive font-semibold mb-2">{error || "Không tìm thấy hồ sơ"}</p>
            <Link
              href="/student/profile"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              Quay lại Hồ sơ cá nhân
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </StudentPageContainer>
    );
  }

  return (
    <StudentPageContainer>
      <div className="max-w-6xl mx-auto pb-8" aria-label="Đánh giá hồ sơ">
        {/* Header – style giống student dashboard */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative rounded-2xl overflow-hidden mb-8 border border-primary/20 shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,var(--tw-gradient-from),transparent)] from-primary/25 to-transparent" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 4L4 20v20l26 16 26-16V20L30 4z' fill='none' stroke='%230f4c81' stroke-width='1'/%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-sm">
                <BarChart3 className="size-6" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-medium text-primary uppercase tracking-wider">
                  Phân tích hồ sơ
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-1">
                  Đánh giá hồ sơ
                </h1>
                <p className="text-muted-foreground mt-2 max-w-xl">
                  Tổng quan năng lực và phân tích AI về điểm mạnh, điểm yếu, spike và khu vực phù hợp.
                </p>
              </div>
            </div>
            <Link
              href="/student/profile"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline shrink-0"
            >
              Quay lại Hồ sơ
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </motion.header>

        {/* Layout dọc: Đánh giá profile → Đánh giá tổng quan (2 biểu đồ) */}
        <motion.div
          className="flex flex-col gap-6 lg:gap-8"
          initial="hidden"
          animate="show"
          variants={container}
        >
          <motion.div variants={listItemVariant} className="min-w-0">
            <ProfileEvaluationSection
              analysisResult={analysisResult ?? null}
              analysisLoading={analysisLoading}
              onAnalyze={handleAnalyzeProfile}
            />
          </motion.div>
          <motion.div variants={listItemVariant} className="min-w-0">
            <OverviewPillarCard
              pillarScores={pillarScores}
              userName={profile?.name}
              onRunAnalysis={handleAnalyzeProfile}
              analysisLoading={analysisLoading}
            />
          </motion.div>
        </motion.div>
      </div>
    </StudentPageContainer>
  );
}
