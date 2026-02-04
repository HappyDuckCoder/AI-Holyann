import { NextRequest, NextResponse } from "next/server";
import { ReportingAIService } from "@/services/ai/reporting";
import { ReportingDBService } from "@/services/database/reporting";

export async function POST(request: NextRequest) {
  try {
    const { student_id } = await request.json();
    const data = await ReportingDBService.getReportData(student_id);
    const reportContent = await ReportingAIService.generateReportContent(data);

    return NextResponse.json({ success: true, data: reportContent });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
