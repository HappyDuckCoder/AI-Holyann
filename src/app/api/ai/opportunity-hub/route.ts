import { NextRequest, NextResponse } from "next/server";
import { OpportunityHubAIService } from "@/services/ai/opportunity-hub";

export async function POST(request: NextRequest) {
  try {
    const { profile_data } = await request.json();
    const opportunities = await OpportunityHubAIService.suggestOpportunities(profile_data);
    return NextResponse.json({ success: true, data: opportunities });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
