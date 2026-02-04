import { NextRequest, NextResponse } from "next/server";
import { PersonalAssessmentAIService } from "@/services/ai/personal-assessment";
import { PersonalAssessmentDBService } from "@/services/database/personal-assessment";

export async function POST(request: NextRequest) {
  try {
    const { student_id, type, answers } = await request.json();
    let result;

    if (type === 'MBTI') {
        result = await PersonalAssessmentAIService.analyzeMBTI(answers);
        await PersonalAssessmentDBService.saveMBTIResult(student_id, result);
    } else if (type === 'RIASEC') {
        result = await PersonalAssessmentAIService.analyzeRIASEC(answers);
        await PersonalAssessmentDBService.saveRIASECResult(student_id, result);
    } else {
        return NextResponse.json({ success: false, error: "Invalid assessment type" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
