/**
 * Gọi API đánh giá MBTI, GRIT, RIASEC từ server-ai (Django).
 * Base URL: AI_API_URL hoặc http://127.0.0.1:8000, path: /hoexapp/api/...
 */

const getBaseUrl = () => {
  const base = process.env.AI_API_URL || "http://127.0.0.1:8000";
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
  questionIdsInOrder: number[]
): Promise<{
  personality_type: string;
  dimension_scores: Record<string, number>;
  confidence: number;
}> {
  const arr = questionIdsInOrder.map((id) => getAnswer(answers, id));
  if (arr.length !== 60 || arr.some((v) => v === undefined || v === null)) {
    throw new Error("MBTI cần đủ 60 câu trả lời (-3 đến 3).");
  }
  const url = `${getBaseUrl()}/hoexapp/api/mbti/`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: arr }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || `MBTI API: ${res.status}`);
  }
  if (!data.success || !data.mbti) {
    throw new Error(data?.error || "Kết quả MBTI không hợp lệ.");
  }
  return data.mbti;
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
  const url = `${getBaseUrl()}/hoexapp/api/grit-scale/`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: obj }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || `GRIT API: ${res.status}`);
  }
  if (!data.success || !data.grit) {
    throw new Error(data?.error || "Kết quả GRIT không hợp lệ.");
  }
  return data.grit;
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
  const url = `${getBaseUrl()}/hoexapp/api/riasec/`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: obj }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || `RIASEC API: ${res.status}`);
  }
  if (!data.success || !data.riasec) {
    throw new Error(data?.error || "Kết quả RIASEC không hợp lệ.");
  }
  return data.riasec;
}
