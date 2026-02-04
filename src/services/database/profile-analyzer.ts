import { prisma } from "@/lib/prisma";

export type StudentProfileData = {
  student: {
    current_school: string | null;
    current_grade: string | null;
    target_country: string | null;
    intended_major: string | null;
    yearly_budget: any;
    personal_desire: string | null;
  };
  academic: {
    gpa: any;
    english: any;
    standardized_tests: any;
  } | null;
  background: {
    awards: any[];
    extracurriculars: any[];
    research: any[];
    work_experience: any[];
  } | null;
};

export class ProfileAnalyzerDBService {
  /**
   * Lấy toàn bộ thông tin hồ sơ học sinh để phân tích
   */
  static async getStudentProfile(studentId: string): Promise<StudentProfileData> {
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
            research_experiences: true,
            work_experiences: true,
            personal_projects: true,
          },
        },
      },
    });

    if (!student) {
      throw new Error(`Student not found with ID: ${studentId}`);
    }

    // Format dữ liệu trước khi trả về
    return {
      student: {
        current_school: student.current_school,
        current_grade: student.current_grade,
        target_country: student.target_country,
        intended_major: student.intended_major,
        yearly_budget: student.yearly_budget,
        personal_desire: student.personal_desire,
      },
      academic: student.academic_profile
        ? {
            gpa: student.academic_profile.gpa_transcript_details,
            english: student.academic_profile.english_certificates,
            standardized_tests: student.academic_profile.standardized_tests,
          }
        : null,
      background: student.background
        ? {
            awards: [
              ...student.background.academic_awards,
              ...student.background.non_academic_awards,
            ],
            extracurriculars: [
              ...student.background.academic_extracurriculars,
              ...student.background.non_academic_extracurriculars,
            ],
            research: student.background.research_experiences,
            work_experience: student.background.work_experiences,
          }
        : null,
    };
  }

  /**
   * Lưu kết quả phân tích AI vào Database
   */
  static async saveAnalysisResult(
    studentId: string,
    result: {
      overall_score: number;
      academic_score: number;
      extracurricular_score: number;
      summary: string;
      swot: any;
      academic_analysis: any;
      extracurricular_analysis: any;
    }
  ) {
    return await prisma.profile_analyses.create({
      data: {
        student_id: studentId,
        overall_score: result.overall_score,
        academic_score: result.academic_score,
        extracurricular_score: result.extracurricular_score,
        summary: result.summary,
        swot_data: result.swot ?? {},
        academic_data: result.academic_analysis ?? {},
        extracurricular_data: result.extracurricular_analysis ?? {},
        analysis_date: new Date(),
      },
    });
  }
}
