import { NextRequest, NextResponse } from "next/server";
import { RecommendationEngineAIService } from "@/services/ai/recommendation-engine";
import { RecommendationEngineDBService } from "@/services/database/recommendation-engine";

export async function POST(request: NextRequest) {
  try {
    const { student_id, profile_data } = await request.json();

    const matches = await RecommendationEngineAIService.getSchoolRecommendations(profile_data);
    await RecommendationEngineDBService.saveSchoolMatches(student_id, matches);

    return NextResponse.json({ success: true, data: matches });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
