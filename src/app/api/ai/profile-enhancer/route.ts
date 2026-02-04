import { NextRequest, NextResponse } from "next/server";
import { ProfileEnhancerAIService } from "@/services/ai/profile-enhancer";
import { ProfileEnhancerDBService } from "@/services/database/profile-enhancer";

export async function POST(request: NextRequest) {
  try {
    const { student_id, type, content } = await request.json();
    let feedback;

    if (type === 'CV') {
        feedback = await ProfileEnhancerAIService.reviewCV(content);
        await ProfileEnhancerDBService.saveCVFeedback(student_id, feedback);
    } else if (type === 'ESSAY') {
        feedback = await ProfileEnhancerAIService.reviewEssay(content);
        // Save essay feedback logic
    }

    return NextResponse.json({ success: true, data: feedback });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
