"use server";

/**
 * AI Profile Analysis Server Action
 *
 * Logic thông minh:
 * 1. Kiểm tra DB trước - nếu có kết quả thì trả về luôn
 * 2. Chỉ gọi AI khi chưa có hoặc forceRefresh = true
 * 3. Sử dụng upsert để tránh duplicate records
 */

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { callProfileAnalysis } from "@/lib/ai-api-client";
import { revalidatePath } from "next/cache";

// Types
export interface AnalysisResult {
  success: boolean;
  data?: ProfileAnalysisData | null;
  source?: "database" | "ai";
  error?: string;
  message?: string;
}

export interface ProfileAnalysisData {
  id: string;
  student_id: string;
  analysis_date: Date;
  full_result: any;
  pillarScores: {
    aca: number | null;
    lan: number | null;
    hdnk: number | null;
    skill: number | null;
  };
  regionalScores: {
    usa: number | null;
    asia: number | null;
    europe: number | null;
  };
  mainSpike: string | null;
  spikeSharpness: string | null;
  spikeScore: number | null;
  swotData: any;
}

/**
 * Chuyển đổi DB record sang format chuẩn
 */
function mapDbRecordToData(record: any): ProfileAnalysisData {
  return {
    id: record.id,
    student_id: record.student_id,
    analysis_date: record.analysis_date,
    full_result: record.full_result,
    pillarScores: {
      aca: record.score_aca,
      lan: record.score_lan,
      hdnk: record.score_hdnk,
      skill: record.score_skill,
    },
    regionalScores: {
      usa: record.score_usa,
      asia: record.score_asia,
      europe: record.score_europe,
    },
    mainSpike: record.main_spike,
    spikeSharpness: record.spike_sharpness,
    spikeScore: record.spike_score,
    swotData: record.swot_data,
  };
}

/**
 * Lấy kết quả phân tích mới nhất từ DB
 */
async function getLatestAnalysisFromDb(
  studentId: string
): Promise<ProfileAnalysisData | null> {
  const record = await prisma.profile_analyses.findFirst({
    where: { student_id: studentId },
    orderBy: { analysis_date: "desc" },
  });

  if (!record) return null;
  return mapDbRecordToData(record);
}

/**
 * Build payload từ student data trong DB để gửi đến AI
 */
async function buildPayloadFromStudent(studentId: string): Promise<any> {
  const student = await prisma.students.findUnique({
    where: { user_id: studentId },
    include: {
      academic_profile: true,
      background: {
        include: {
          academic_awards: true,
          academic_extracurriculars: true,
          non_academic_awards: true,
          non_academic_extracurriculars: true,
          personal_projects: true,
          subject_scores: true,
        },
      },
      student_skills: true,
    },
  });

  if (!student) {
    throw new Error("Không tìm thấy thông tin học sinh");
  }

  // Build academic section
  const gpaData =
    (student.academic_profile?.gpa_transcript_details as any) || {};
  const gpa =
    gpaData.grade12 ||
    gpaData.grade11 ||
    gpaData.grade10 ||
    gpaData.gpa ||
    7.0;

  const subjectScores =
    student.background?.subject_scores?.map((s: any) => ({
      subject: s.subject,
      score: s.score,
    })) || [];

  const academicAwards =
    student.background?.academic_awards?.map((a: any) => ({
      award_name: a.award_name,
      year: a.year || undefined,
      rank: a.rank || undefined,
      region: a.region || undefined,
      category: a.category || undefined,
    })) || [];

  // Build language section
  const englishCerts =
    (student.academic_profile?.english_certificates as any) || {};
  const stdTests =
    (student.academic_profile?.standardized_tests as any) || {};

  const languages: { language_name: string; score: string }[] = [];
  const standardizedTests: { test_name: string; score: string }[] = [];

  // Parse English certificates
  if (Array.isArray(englishCerts)) {
    englishCerts.forEach((cert: any) => {
      if (cert?.type && cert?.score) {
        languages.push({
          language_name: cert.type,
          score: String(cert.score),
        });
      }
    });
  }

  // Parse standardized tests
  if (Array.isArray(stdTests)) {
    stdTests.forEach((test: any) => {
      if (test?.type && test?.score) {
        standardizedTests.push({
          test_name: test.type,
          score: String(test.score),
        });
      }
    });
  }

  // Build actions section
  const actions = [
    ...(student.background?.academic_extracurriculars || []).map((e: any) => ({
      action_name: e.activity_name,
      role: e.role?.toUpperCase() || "MEMBER",
      scale: e.scale || 10,
      region: e.region || "school",
    })),
    ...(student.background?.non_academic_extracurriculars || []).map(
      (e: any) => ({
        action_name: e.activity_name,
        role: e.role?.toUpperCase() || "MEMBER",
        scale: e.scale || 10,
        region: e.region || "school",
      })
    ),
  ];

  // Build non-academic awards
  const nonAcademicAwards =
    student.background?.non_academic_awards?.map((a: any) => ({
      award_name: a.award_name,
      category: a.category || "art",
      year: a.year || undefined,
      rank: a.rank || undefined,
      region: a.region || undefined,
    })) || [];

  // Build personal projects
  const personalProjects =
    student.background?.personal_projects?.map((p: any) => ({
      project_name: p.project_name,
      topic: p.topic || "Science/Tech",
      description: p.description || undefined,
      duration_months: p.duration_months || undefined,
      impact: p.impact || undefined,
    })) || [];

  // Build skills
  const skills =
    student.student_skills?.map((s: any) => ({
      skill_name: s.skill_name,
      proficiency: s.proficiency?.toUpperCase() || "INTERMEDIATE",
    })) || [];

  return {
    academic: {
      gpa: parseFloat(gpa) || 7.0,
      subject_scores: subjectScores,
      academic_awards: academicAwards,
    },
    language_and_standardized: {
      languages,
      standardized_tests: standardizedTests,
    },
    action: {
      actions,
    },
    non_academic_awards: nonAcademicAwards,
    personal_projects: personalProjects,
    skill: {
      skills,
    },
  };
}

/**
 * Gọi AI API và lưu kết quả vào DB
 */
async function callAIAndSave(
  studentId: string,
  payload: any
): Promise<ProfileAnalysisData> {
  // Gọi AI API
  const aiResult = await callProfileAnalysis(payload);

  if (!aiResult || !aiResult.summary?.success) {
    throw new Error("AI server trả về kết quả không hợp lệ");
  }

  // Extract data từ AI response
  const pillarScores = aiResult["D. Điểm số gốc (Pillar Scores)"] || {};
  const regions =
    aiResult["A. Đánh giá điểm số (Weighted Score Evaluation)"]?.["Khu vực"] ||
    [];
  const spike = aiResult["C. Nhận diện Spike (Yếu tố cốt lõi)"] || {};
  const swot = aiResult["B. Phân tích SWOT"] || {};

  // Find regional scores
  const usaScore =
    regions.find((r: any) => r["Vùng"] === "Mỹ")?.["Điểm số (Score)"] || 0;
  const asiaScore =
    regions.find((r: any) => r["Vùng"] === "Châu Á")?.["Điểm số (Score)"] || 0;
  const europeScore =
    regions.find((r: any) => r["Vùng"]?.includes("Âu"))?.["Điểm số (Score)"] ||
    0;

  // Upsert: Update nếu đã có, Create nếu chưa có
  // Vì student_id không unique trong schema, ta dùng deleteMany + create
  // hoặc tìm record cũ nhất và update
  const existingRecord = await prisma.profile_analyses.findFirst({
    where: { student_id: studentId },
    orderBy: { analysis_date: "desc" },
  });

  let savedRecord;

  const updateData = {
    analysis_date: new Date(),
    input_data: payload,
    full_result: aiResult,
    score_aca: pillarScores["Học thuật (Aca)"] || 0,
    score_lan: pillarScores["Ngôn ngữ (Lan)"] || 0,
    score_hdnk: pillarScores["Hoạt động ngoại khóa (HDNK)"] || 0,
    score_skill: pillarScores["Kỹ năng (Skill)"] || 0,
    score_usa: usaScore,
    score_asia: asiaScore,
    score_europe: europeScore,
    main_spike: spike["Loại Spike hiện tại"] || null,
    spike_sharpness: spike["Độ sắc (Sharpness)"] || null,
    spike_score: spike["Điểm số"] || 0,
    swot_data: swot,
    all_spike_scores: spike["Tất cả Spike Scores"] || {},
    academic_data: payload.academic || {},
    extracurricular_data: { actions: payload.action?.actions || [] },
    skill_data: { skills: payload.skill?.skills || [] },
    overall_score:
      (aiResult.summary?.total_pillar_scores?.aca || 0) +
      (aiResult.summary?.total_pillar_scores?.lan || 0) +
      (aiResult.summary?.total_pillar_scores?.hdnk || 0) +
      (aiResult.summary?.total_pillar_scores?.skill || 0),
    academic_score: aiResult.summary?.total_pillar_scores?.aca || 0,
    extracurricular_score: aiResult.summary?.total_pillar_scores?.hdnk || 0,
    summary: `Spike: ${aiResult.summary?.main_spike || "N/A"}, Sharpness: ${aiResult.summary?.sharpness || "N/A"}`,
    updated_at: new Date(),
  };

  if (existingRecord) {
    savedRecord = await prisma.profile_analyses.update({
      where: { id: existingRecord.id },
      data: updateData as Prisma.profile_analysesUpdateInput,
    });
  } else {
    savedRecord = await prisma.profile_analyses.create({
      data: {
        student_id: studentId,
        ...updateData,
      } as Prisma.profile_analysesUncheckedCreateInput,
    });
  }

  return mapDbRecordToData(savedRecord);
}

/**
 * Main Server Action: Phân tích hồ sơ học sinh
 *
 * @param studentId - ID của học sinh
 * @param forceRefresh - Bắt buộc gọi AI mới (mặc định: false)
 * @returns AnalysisResult với source là 'database' hoặc 'ai'
 */
export async function analyzeStudentProfile(
  studentId: string,
  forceRefresh: boolean = false
): Promise<AnalysisResult> {
  try {
    // Validate input
    if (!studentId || studentId.trim() === "") {
      return {
        success: false,
        error: "Student ID không hợp lệ",
      };
    }

    // ========== BƯỚC 1: Kiểm tra DB (nếu không force refresh) ==========
    if (!forceRefresh) {
      const existingData = await getLatestAnalysisFromDb(studentId);

      if (existingData && existingData.full_result) {
        console.log(
          `✅ [AI Analysis] Found existing analysis for student ${studentId}, returning from DB`
        );
        return {
          success: true,
          data: existingData,
          source: "database",
          message: "Kết quả được lấy từ dữ liệu đã lưu",
        };
      }
    }

    // ========== BƯỚC 2: Gọi AI và lưu mới ==========
    console.log(
      `🔄 [AI Analysis] Calling AI for student ${studentId}${forceRefresh ? " (force refresh)" : ""}`
    );

    // Build payload từ student data
    const payload = await buildPayloadFromStudent(studentId);

    // Validate GPA
    if (!payload.academic?.gpa) {
      return {
        success: false,
        error: "Vui lòng cập nhật GPA để sử dụng tính năng phân tích AI",
      };
    }

    // Gọi AI và lưu
    const newData = await callAIAndSave(studentId, payload);

    console.log(`✅ [AI Analysis] AI analysis completed and saved for student ${studentId}`);

    // Revalidate cache
    revalidatePath(`/student/profile`);

    return {
      success: true,
      data: newData,
      source: "ai",
      message: forceRefresh
        ? "Đã phân tích lại hồ sơ thành công"
        : "Đã phân tích hồ sơ thành công",
    };
  } catch (error: any) {
    console.error("❌ [AI Analysis] Error:", error);

    return {
      success: false,
      error: error.message || "Có lỗi xảy ra khi phân tích hồ sơ",
    };
  }
}

/**
 * Lấy kết quả phân tích đã lưu (không gọi AI)
 */
export async function getStudentAnalysis(
  studentId: string
): Promise<AnalysisResult> {
  try {
    if (!studentId) {
      return {
        success: false,
        error: "Student ID không hợp lệ",
      };
    }

    const data = await getLatestAnalysisFromDb(studentId);

    if (!data) {
      return {
        success: false,
        error: "Chưa có kết quả phân tích. Vui lòng phân tích hồ sơ trước.",
      };
    }

    return {
      success: true,
      data,
      source: "database",
    };
  } catch (error: any) {
    console.error("❌ [Get Analysis] Error:", error);
    return {
      success: false,
      error: error.message || "Có lỗi khi lấy kết quả phân tích",
    };
  }
}

/**
 * Kiểm tra xem student đã có kết quả phân tích chưa
 */
export async function hasExistingAnalysis(studentId: string): Promise<boolean> {
  try {
    const count = await prisma.profile_analyses.count({
      where: { student_id: studentId },
    });
    return count > 0;
  } catch {
    return false;
  }
}
