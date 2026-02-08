/**
 * AI API Client Utility
 *
 * Centralized client for calling Django AI server endpoints
 * Uses AI_SERVER_URL from environment variables
 */

const AI_API_BASE = process.env.AI_SERVER_URL || "http://127.0.0.1:8000";

// Ensure base URL doesn't have trailing slash
const getBaseUrl = () => {
  const base = AI_API_BASE.replace(/\/+$/, "");
  // If AI_SERVER_URL is just IP:port, add http://
  if (!base.startsWith("http://") && !base.startsWith("https://")) {
    return `http://${base}`;
  }
  return base;
};

const BASE_URL = getBaseUrl();

/**
 * Call AI API endpoint
 */
export async function callAIAPI<T = any>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const { method = "POST", body, headers = {} } = options;

  // Ensure endpoint starts with /
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${path}`;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
    cache: "no-store", // Disable caching for AI API calls
    // Add timeout for better error handling (30 seconds)
    signal: AbortSignal.timeout(30000),
  };

  if (body && method !== "GET") {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    // Log request details for debugging
    console.log(`🔄 [AI API] ${method} ${url}`);
    if (body) {
      console.log(`📤 [AI API] Request body:`, JSON.stringify(body).substring(0, 200));
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: any;
      try {
        errorData = errorText
          ? JSON.parse(errorText)
          : { error: "Unknown error" };
      } catch {
        errorData = { error: errorText || "Unknown error" };
      }

      console.error(`❌ [AI API] Error ${response.status}:`, errorData);

      // Extract detailed error message from Django
      let errorMessage = errorData.error || errorData.message || errorData.detail;

      // If Django returned a traceback or detailed error, try to extract it
      if (typeof errorData === 'object') {
        // Check for nested error structures
        if (errorData.details) {
          errorMessage = errorData.details;
        } else if (errorData.traceback) {
          errorMessage = errorData.traceback;
        }
      }

      // If still no clear message, use the raw error text
      if (!errorMessage || errorMessage === "Unknown error") {
        errorMessage = errorText.substring(0, 500) || `AI API returned ${response.status}`;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`✅ [AI API] Success ${response.status}`);
    return data;
  } catch (error) {
    console.error(`❌ [AI API] Request failed:`, error);

    // Check for specific error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`AI server timeout after 30 seconds. Please check if Django server is running at ${BASE_URL}`);
      }
      if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        throw new Error(`Cannot connect to AI server at ${BASE_URL}. Please ensure Django server is running.`);
      }
      throw error;
    }
    throw new Error("Failed to call AI API");
  }
}

/**
 * Feature 1: Profile Analysis
 */
export async function callProfileAnalysis(payload: any) {
  return callAIAPI("/hoexapp/api/profile-analysis/", {
    method: "POST",
    body: payload,
  });
}

import type {
  CareerAssessmentInput,
  CareerAssessmentOutput,
  MBTIInput,
  MBTIOutput,
  GritInput,
  GritOutput,
  RIASECInput,
  RIASECOutput,
} from "./schemas/career-assessment.schema";

/**
 * Feature 2: Career Assessment (Combined)
 */
export async function callCareerAssessment(
  payload: CareerAssessmentInput
): Promise<CareerAssessmentOutput> {
  return callAIAPI<CareerAssessmentOutput>("/hoexapp/api/career-assessment/", {
    method: "POST",
    body: payload,
  });
}

/**
 * Feature 2: MBTI Assessment Only
 */
export async function callMBTIAssessment(
  answers: number[]
): Promise<MBTIOutput> {
  const payload: MBTIInput = { answers };
  return callAIAPI<MBTIOutput>("/hoexapp/api/mbti/", {
    method: "POST",
    body: payload,
  });
}

/**
 * Feature 2: GRIT Scale Assessment Only
 */
export async function callGritAssessment(
  answers: Record<string, number>
): Promise<GritOutput> {
  const payload: GritInput = { answers };
  return callAIAPI<GritOutput>("/hoexapp/api/grit-scale/", {
    method: "POST",
    body: payload,
  });
}

/**
 * Feature 2: RIASEC Assessment Only
 */
export async function callRIASECAssessment(
  answers: Record<string, number>
): Promise<RIASECOutput> {
  const payload: RIASECInput = { answers };
  return callAIAPI<RIASECOutput>("/hoexapp/api/riasec/", {
    method: "POST",
    body: payload,
  });
}

/**
 * Feature 3: University Recommendation
 */
export async function callUniversityRecommendation(payload: {
  feature1_output: any;
  feature2_output: any;
  top_n?: number;
  min_match_score?: number;
  duration_months?: number;
  start_date?: string;
}) {
  return callAIAPI("/hoexapp/api/university-recommendation/", {
    method: "POST",
    body: payload,
  });
}
