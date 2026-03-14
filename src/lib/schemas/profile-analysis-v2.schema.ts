/**
 * Feature 1 API v2 – theo doc.md / input-analysis.json, output-analysis.json
 * Server-ai: POST /api/analysis-profile, POST /api/enhence-profile
 */

export interface Feature1AnalysisInput {
  gpa: { value_10: number };
  subjects: Array<{ name: string; score_10: number; group: "natural" | "language" | "social" }>;
  languages: Array<{ language_name: string; score_name: string; value: number }>;
  standardized_tests: Array<{
    name: string;
    value: number;
    max_value: number;
    group: string;
  }>;
  academic_awards: string[];
  other_awards: string[];
  academic_extracurricular: Array<{
    name: string;
    role: string;
    impact_tier: number;
  }>;
  experiments: string[];
  projects: Array<{ name: string; group: string; tier: number }>;
  hard_skills: Array<{ name: string; level: string }>;
  soft_skills: Array<{ name: string; level: string }>;
}

export interface Feature1AnalysisOutput {
  pillar_scores: { academic: number; language: number; extracurricular: number; skills: number };
  spikes: Array<{
    type: string;
    tier: string;
    evidence?: string;
    score?: number;
    comment?: string;
  }>;
  areas: {
    A: { name: string; suitability: number; suitability_level: string; reason: string };
    B: { name: string; suitability: number; suitability_level: string; reason: string };
    C: { name: string; suitability: number; suitability_level: string; reason: string };
  };
  swot: { S: string[]; W: string[]; O: string[]; T: string[] };
}

export interface Feature1EnhanceInput {
  analysis_information: Feature1AnalysisOutput;
  willing_area: "A" | "B" | "C";
}

export interface Feature1EnhanceOutput {
  list_suggestion: Array<{ prior: string; what_to_do: string }>;
  roadmap: {
    type: string;
    months: Array<{ month: number; tasks: string[]; target: string }>;
  };
  pillar_score_after_enhance: {
    academic: number;
    language: number;
    extracurricular: number;
    skills: number;
  };
}
