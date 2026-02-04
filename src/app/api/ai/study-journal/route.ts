import { NextRequest, NextResponse } from "next/server";
import { StudyJournalAIService } from "@/services/ai/study-journal";
import { StudyJournalDBService } from "@/services/database/study-journal";

export async function POST(request: NextRequest) {
  try {
    const { student_id, month, year } = await request.json();
    const entries = await StudyJournalDBService.getJournalEntries(student_id, month, year);
    const analysis = await StudyJournalAIService.analyzeMonthlyProgress(entries);
    await StudyJournalDBService.saveMonthlyAnalysis(student_id, analysis);

    return NextResponse.json({ success: true, data: analysis });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
