import { NextRequest, NextResponse } from "next/server";
import { ProfileAnalyzerDBService } from "@/services/database/profile-analyzer";
import { ProfileAnalyzerAIService } from "@/services/ai/profile-analyzer";

export async function POST(request: NextRequest) {
  try {
    const { student_id } = await request.json();

    if (!student_id) {
      return NextResponse.json(
        { success: false, error: "student_id is required" },
        { status: 400 }
      );
    }

    // 1. Get Data from DB
    const profileData = await ProfileAnalyzerDBService.getStudentProfile(student_id);

    // 2. Call AI Service
    const analysisResult = await ProfileAnalyzerAIService.analyzeProfile(profileData);

    // 3. Save Result to DB
    const savedResult = await ProfileAnalyzerDBService.saveAnalysisResult(
      student_id,
      analysisResult
    );

    return NextResponse.json({
      success: true,
      data: savedResult,
    });
  } catch (error: any) {
    console.error("[Profile Analyzer API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
