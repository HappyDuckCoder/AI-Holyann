/**
 * Gọi API đánh giá MBTI, GRIT, RIASEC từ FastAPI server-ai.
 * Base URL: AI_SERVER_URL hoặc http://127.0.0.1:8000.
 * Path (FastAPI):
 *   - /api/v1/feature2/mbti
 *   - /api/v1/feature2/grit-scale
 *   - /api/v1/feature2/riasec
 * Server-AI trả về trực tiếp: MBTI { personality_type, dimension_scores, confidence }, GRIT { score, level, description, ... }, RIASEC { code, scores, top3 } — không bọc success/mbti/grit/riasec.
 */

const getBaseUrl = () => {
  const base = process.env.AI_SERVER_URL || process.env.AI_API_URL || "http://127.0.0.1:8000";
  return base.replace(/\/+$/, "");
};

type AnswersRecord = Record<string | number, string | number | boolean>;

function getAnswer(answers: AnswersRecord, id: number): number | undefined {
  const v = answers[id] ?? answers[String(id)];
  if (v === undefined || v === null) return undefined;
  return Number(v);
}

/** MBTI: server-ai cần mảng 60 giá trị -3..3 theo thứ tự câu hỏi (sorted by id). */
export async function callMBTI(
  answers: AnswersRecord,
  questionIdsInOrder: number[],
): Promise<{
  personality_type: string;
  dimension_scores: Record<string, number>;
  confidence: number;
}> {
  const arr = questionIdsInOrder.map((id) => getAnswer(answers, id));
  if (arr.length !== 60 || arr.some((v) => v === undefined || v === null)) {
    throw new Error("MBTI cần đủ 60 câu trả lời (-3 đến 3).");
  }
  const url = `${getBaseUrl()}/api/v1/feature2/mbti`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: arr }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || data?.details || `MBTI API: ${res.status}`);
  }
  if (data?.error || typeof data?.personality_type !== "string") {
    throw new Error(data?.error || "Kết quả MBTI không hợp lệ.");
  }
  return {
    personality_type: data.personality_type,
    dimension_scores: data.dimension_scores ?? {},
    confidence: typeof data.confidence === "number" ? data.confidence : 0,
  };
}

/** GRIT: server-ai cần object keys 1-12, values 1-5. Trả về score, level, description, passion_score, perseverance_score. */
export async function callGRIT(answers: AnswersRecord): Promise<{
  score: number;
  level: string;
  description: string;
  passion_score?: number;
  perseverance_score?: number;
}> {
  const obj: Record<number, number> = {};
  for (let i = 1; i <= 12; i++) {
    const v = getAnswer(answers, i);
    if (v === undefined || v < 1 || v > 5) {
      throw new Error("GRIT cần đủ 12 câu trả lời (1-5).");
    }
    obj[i] = v;
  }
  const url = `${getBaseUrl()}/api/v1/feature2/grit-scale`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: obj }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || `GRIT API: ${res.status}`);
  }
  if (data?.error || typeof data?.score !== "number") {
    throw new Error(data?.error || "Kết quả GRIT không hợp lệ.");
  }
  return {
    score: data.score,
    level: data.level ?? "",
    description: data.description ?? "",
    passion_score: data.passion_score,
    perseverance_score: data.perseverance_score,
  };
}

const RIASEC_LETTER_MAP: Record<string, string> = {
  R: "R",
  I: "I",
  A: "A",
  S: "S",
  E: "E",
  C: "C",
  Realistic: "R",
  Investigative: "I",
  Artistic: "A",
  Social: "S",
  Enterprising: "E",
  Conventional: "C",
};

function normalizeRIASECScores(
  raw: Record<string, number> | null | undefined,
): Record<string, number> {
  const out: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  if (!raw || typeof raw !== "object") return out;
  for (const [key, val] of Object.entries(raw)) {
    const letter =
      RIASEC_LETTER_MAP[key] ?? (key.length === 1 ? key : undefined);
    if (letter && typeof val === "number" && !Number.isNaN(val)) {
      out[letter] = val;
    }
  }
  return out;
}

function normalizeRIASECTop3(raw: unknown): [string, number][] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (x): x is [string, number] =>
        Array.isArray(x) &&
        x.length >= 2 &&
        typeof x[0] === "string" &&
        typeof x[1] === "number",
    )
    .map(
      ([domain, score]) =>
        [
          RIASEC_LETTER_MAP[domain] ?? String(domain).charAt(0).toUpperCase(),
          score,
        ] as [string, number],
    )
    .slice(0, 3);
}

/** RIASEC: server-ai cần object keys 1-48, values 1-5. */
export async function callRIASEC(answers: AnswersRecord): Promise<{
  code: string;
  scores: Record<string, number>;
  top3: [string, number][];
}> {
  const obj: Record<number, number> = {};
  for (let i = 1; i <= 48; i++) {
    const v = getAnswer(answers, i);
    if (v === undefined || v < 1 || v > 5) {
      throw new Error("RIASEC cần đủ 48 câu trả lời (1-5).");
    }
    obj[i] = v;
  }
  const url = `${getBaseUrl()}/api/v1/feature2/riasec`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: obj }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || data?.detail || `RIASEC API: ${res.status}`);
  }
  if (data?.error || (data?.code == null && !Array.isArray(data?.top3))) {
    throw new Error(data?.error || data?.detail || "Kết quả RIASEC không hợp lệ.");
  }
  const scores = normalizeRIASECScores(data.scores);
  const top3 = normalizeRIASECTop3(data.top3);
  const code =
    (data.code && String(data.code).replace(/\s/g, "").slice(0, 6)) ||
    top3.map(([c]) => c).join("");
  return { code, scores, top3 };
}
