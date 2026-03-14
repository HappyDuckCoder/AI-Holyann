/**
 * Build Feature1AnalysisInput from DB for profile-analysis (no form on client).
 */
import { prisma } from "@/lib/prisma";
import type { Feature1AnalysisInput } from "@/lib/schemas/profile-analysis-v2.schema";

const SUBJECT_GROUP = ["natural", "language", "social"] as const;
type SubjectGroup = (typeof SUBJECT_GROUP)[number];
function toSubjectGroup(s: string | null | undefined): SubjectGroup {
  if (!s) return "natural";
  const lower = s.toLowerCase();
  if (lower.includes("language") || lower.includes("ngoại ngữ") || lower === "language") return "language";
  if (lower.includes("social") || lower.includes("xã hội") || lower === "social") return "social";
  return "natural";
}

export async function buildProfilePayloadFromDb(studentId: string): Promise<Feature1AnalysisInput | null> {
  const student = await prisma.students.findUnique({
    where: { user_id: studentId },
    include: {
      student_academic_profiles: true,
      student_backgrounds: {
        include: {
          subject_scores: true,
          academic_awards: true,
          non_academic_awards: true,
          academic_extracurriculars: true,
          personal_projects: true,
        },
      },
      student_skills: true,
    },
  });

  if (!student) return null;
  const profile = student.student_academic_profiles;
  const bg = student.student_backgrounds;

  const gpaDetails = (profile?.gpa_transcript_details as Record<string, string | number> | null) ?? {};
  const gpaValue =
    typeof gpaDetails.grade12 === "number"
      ? gpaDetails.grade12
      : parseFloat(String(gpaDetails.grade12 || gpaDetails.grade11 || gpaDetails.grade10 || gpaDetails.grade9 || 0)) ||
        0;

  const englishCerts = (profile?.english_certificates as Array<{ type?: string; score?: string }> | null) ?? [];
  const languages = Array.isArray(englishCerts)
    ? englishCerts
        .filter((c) => c && typeof c === "object")
        .map((c) => ({
          language_name: (c.type as string) || "",
          score_name: "score",
          value: parseFloat(String(c.score ?? 0)) || 0,
        }))
    : [];

  const stdTestsRaw = (profile?.standardized_tests as Array<{ type?: string; score?: string; max?: number }> | null) ?? [];
  const standardized_tests = Array.isArray(stdTestsRaw)
    ? stdTestsRaw
        .filter((t) => t && typeof t === "object")
        .map((t) => ({
          name: (t.type as string) || "",
          value: parseFloat(String(t.score ?? 0)) || 0,
          max_value: typeof t.max === "number" ? t.max : 1600,
          group: "general",
        }))
    : [];

  const subjectScores = (bg?.subject_scores ?? []).map((s) => ({
    name: s.subject || "",
    score_10: Number(s.score) || 0,
    group: toSubjectGroup(s.group ?? undefined),
  }));

  const academic_awards = (bg?.academic_awards ?? []).map((a) => a.award_name || "").filter(Boolean);
  const other_awards = (bg?.non_academic_awards ?? []).map((a) => a.award_name || "").filter(Boolean);

  const academic_extracurricular = (bg?.academic_extracurriculars ?? []).map((e) => ({
    name: e.activity_name || "",
    role: e.role || "",
    impact_tier: typeof e.impact_tier === "number" ? e.impact_tier : 1,
  }));

  const experimentsRaw = bg?.experiments;
  const experiments: string[] = Array.isArray(experimentsRaw)
    ? experimentsRaw.filter((x): x is string => typeof x === "string")
    : [];

  const projects = (bg?.personal_projects ?? []).map((p) => ({
    name: p.project_name || "",
    group: (p.topic as string) || "general",
    tier: typeof p.tier === "number" ? p.tier : 1,
  }));

  const hard_skills = (student.student_skills ?? [])
    .filter((s) => (s.category || "").toLowerCase() === "hard")
    .map((s) => ({ name: s.skill_name || "", level: s.proficiency || "" }));
  const soft_skills = (student.student_skills ?? [])
    .filter((s) => (s.category || "").toLowerCase() === "soft")
    .map((s) => ({ name: s.skill_name || "", level: s.proficiency || "" }));

  return {
    gpa: { value_10: gpaValue },
    subjects: subjectScores,
    languages,
    standardized_tests,
    academic_awards,
    other_awards,
    academic_extracurricular,
    experiments,
    projects,
    hard_skills,
    soft_skills,
  };
}
