import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy runs on matched routes (formerly middleware).
 * Public routes (no auth): /universities, /universities/*, /api/universities, /api/universities/*
 * Add auth redirect logic below for other routes; public routes are excluded via matcher.
 */
export function proxy(request: NextRequest) {
  // Pass through – add auth redirect here for protected routes if needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Exclude: api, _next/static, _next/image, favicon, universities (public list/detail)
     * So student/universities and student/universities/:id are never run through auth when you add it.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|student/universities|student/universities/:id|api/student/universities|api/student/universities/:id).*)",
  ],
};
