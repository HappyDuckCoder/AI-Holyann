import { NextRequest, NextResponse } from "next/server";
import { getCareerImageUrl } from "@/lib/career-images";

/**
 * GET /api/career-image?title=...&category=...
 * Returns a stable image URL for the given job title/category.
 * Used by career recommendation cards to show relevant images.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") ?? "";
    const category = searchParams.get("category") ?? "";
    const url = getCareerImageUrl(title, category);
    return NextResponse.json({ url, success: true });
  } catch (e) {
    const fallback = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=240&fit=crop";
    return NextResponse.json({ url: fallback, success: true });
  }
}
