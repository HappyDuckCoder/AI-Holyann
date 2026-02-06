/**
 * Module 4: Profile Enhancer API (Feature 4)
 * 
 * POST /api/module4/profile-enhancer/
 * 
 * Profile enhancement tools: CV review, Essay review
 */

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
  } catch (error: unknown) {
    console.error('❌ [Module 4 - Profile Enhancer API] Error:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
