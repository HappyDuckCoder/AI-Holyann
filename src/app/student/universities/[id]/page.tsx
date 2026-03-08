'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((c) => 0x1f1e6 - 65 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

type University = {
  id: number;
  qs_rank: number;
  name: string;
  country: string;
  country_code: string;
  city: string | null;
  region: string | null;
  type: string | null;
  founded_year: number | null;
  total_students: number | null;
  website: string | null;
  qs_overall_score: number;
  academic_reputation: number;
  employer_reputation: number;
  faculty_student_ratio: number;
  citations_per_faculty: number;
  international_faculty: number;
  international_students: number;
  strong_subjects: string[];
  description: string | null;
};

const SCORE_KEYS: { key: keyof University; label: string }[] = [
  { key: 'qs_overall_score', label: 'Overall Score' },
  { key: 'academic_reputation', label: 'Academic Reputation' },
  { key: 'employer_reputation', label: 'Employer Reputation' },
  { key: 'faculty_student_ratio', label: 'Faculty/Student Ratio' },
  { key: 'citations_per_faculty', label: 'Citations per Faculty' },
  { key: 'international_faculty', label: 'International Faculty' },
  { key: 'international_students', label: 'International Students' },
];

export default function StudentUniversityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    void Promise.resolve(params).then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/universities/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.university) setUniversity(data.university);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !id) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-background text-foreground">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!university) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-background px-4 text-foreground">
        <p className="text-muted-foreground">Không tìm thấy trường.</p>
        <Link href="/student/universities" className="text-primary hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  const regionGradients: Record<string, string> = {
    Asia: 'from-amber-500/20 to-background',
    Europe: 'from-blue-500/20 to-background',
    'North America': 'from-emerald-500/20 to-background',
    Oceania: 'from-cyan-500/20 to-background',
    'Latin America': 'from-rose-500/20 to-background',
    'Middle East & Africa': 'from-violet-500/20 to-background',
  };
  const heroGradient =
    (university.region && regionGradients[university.region]) || 'from-muted to-background';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border px-4 py-4 sm:px-6 md:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/student/universities"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            ← Quay lại danh sách
          </Link>
        </div>
      </div>

      <header className={`bg-linear-to-b ${heroGradient} px-4 py-10 sm:px-6 md:px-8`}>
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center gap-3">
            <span
              className={`rounded-lg px-3 py-1.5 text-sm font-bold ${
                university.qs_rank <= 10
                  ? 'bg-amber-500 text-amber-950 dark:bg-amber-400 dark:text-amber-950'
                  : university.qs_rank <= 50
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-orange-600 text-white dark:bg-orange-500 dark:text-white'
              }`}
            >
              #{university.qs_rank} QS World
            </span>
            <span className="text-muted-foreground">
              {getFlagEmoji(university.country_code)} {university.country}
            </span>
          </div>
          <h1 className="font-university-display text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
            {university.name}
          </h1>
          {university.description && (
            <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
              {university.description}
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:px-8">
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Thông tin
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Quốc gia</p>
              <p className="font-medium text-foreground">{university.country}</p>
            </div>
            {university.city && (
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">Thành phố</p>
                <p className="font-medium text-foreground">{university.city}</p>
              </div>
            )}
            {university.type && (
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">Loại trường</p>
                <p className="font-medium text-foreground">{university.type}</p>
              </div>
            )}
            {university.founded_year != null && (
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">Năm thành lập</p>
                <p className="font-medium text-foreground">{university.founded_year}</p>
              </div>
            )}
            {university.total_students != null && (
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">Số sinh viên</p>
                <p className="font-medium text-foreground">
                  {university.total_students.toLocaleString()}
                </p>
              </div>
            )}
            {university.website && (
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">Website</p>
                <a
                  href={university.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  {(() => {
                    try {
                      return new URL(university.website!).hostname;
                    } catch {
                      return 'Link';
                    }
                  })()}
                </a>
              </div>
            )}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            QS Scores breakdown
          </h2>
          <div className="space-y-4">
            {SCORE_KEYS.map(({ key, label }) => {
              const value = university[key];
              if (typeof value !== 'number') return null;
              return (
                <div key={key}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-foreground">{label}</span>
                    <span className="text-muted-foreground">{value.toFixed(1)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                      style={{ width: `${Math.min(100, value)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {university.strong_subjects && university.strong_subjects.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Ngành mạnh
            </h2>
            <div className="flex flex-wrap gap-2">
              {university.strong_subjects.map((s) => (
                <span
                  key={s}
                  className="rounded-lg bg-secondary/20 px-3 py-1.5 text-sm text-secondary"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Thông tin tham khảo từ QS World University Rankings 2024
        </p>
      </main>
    </div>
  );
}
