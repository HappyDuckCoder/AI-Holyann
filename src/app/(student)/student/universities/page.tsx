'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

const REGIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'Asia', label: 'Châu Á' },
  { value: 'Europe', label: 'Châu Âu' },
  { value: 'North America', label: 'Bắc Mỹ' },
  { value: 'Oceania', label: 'Châu Đại Dương' },
  { value: 'Latin America', label: 'Mỹ Latin' },
  { value: 'Middle East & Africa', label: 'Trung Đông & Châu Phi' },
];

const RANK_RANGES = [
  { value: '', label: 'Tất cả', min: 1, max: 500 },
  { value: '10', label: 'Top 10', min: 1, max: 10 },
  { value: '25', label: 'Top 25', min: 1, max: 25 },
  { value: '50', label: 'Top 50', min: 1, max: 50 },
  { value: '100', label: 'Top 100', min: 1, max: 100 },
];

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
  website: string | null;
  qs_overall_score: number;
  strong_subjects: string[];
};

function RankBadge({ rank }: { rank: number }) {
  const isGold = rank <= 10;
  const isSilver = rank <= 50 && rank > 10;
  const bgClass = isGold
    ? 'bg-amber-500 text-amber-950 dark:bg-amber-400 dark:text-amber-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
    : isSilver
      ? 'bg-muted text-muted-foreground'
      : 'bg-orange-600 text-white dark:bg-orange-500 dark:text-white';
  return (
    <span
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-bold ${bgClass}`}
    >
      #{rank}
    </span>
  );
}

export default function StudentUniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState('');
  const [rankRange, setRankRange] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [countryInput, setCountryInput] = useState('');

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (searchInput.trim()) p.set('search', searchInput.trim());
    if (region) p.set('region', region);
    if (countryInput.trim()) p.set('country', countryInput.trim());
    const range = RANK_RANGES.find((r) => r.value === rankRange);
    if (range && range.value) {
      p.set('minRank', String(range.min));
      p.set('maxRank', String(range.max));
    }
    return p.toString();
  }, [searchInput, region, countryInput, rankRange]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/universities${params ? `?${params}` : ''}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.universities)) {
          setUniversities(data.universities);
        }
      })
      .finally(() => setLoading(false));
  }, [params]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header giống student/dashboard (DashboardHero) */}
      <section
        aria-label="Danh sách trường"
        className="relative mb-6 overflow-hidden text-white"
        style={{
          background:
            'linear-gradient(135deg, var(--primary) 0%, var(--brand-deep) 50%, var(--brand-cyan) 100%)',
        }}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 right-1/4 h-40 w-80 rounded-full bg-[var(--brand-cyan)]/20 blur-2xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative px-6 py-8 sm:px-10 sm:py-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
            Danh sách trường
          </p>
          <h1 className="mt-2 font-university-display text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
            World&apos;s Best Universities
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70">
            QS World University Rankings 2024 — khám phá 100+ trường đại học hàng đầu thế giới.
          </p>
        </div>
      </section>

      <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-4 backdrop-blur sm:px-6 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            placeholder="Tìm MIT, Oxford, Tokyo..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full max-w-md rounded-lg border border-border bg-card px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Khu vực
            </span>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {REGIONS.map((r) => (
                <option key={r.value || 'all'} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Quốc gia"
              value={countryInput}
              onChange={(e) => setCountryInput(e.target.value)}
              className="w-28 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
            />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Hạng
            </span>
            <select
              value={rankRange}
              onChange={(e) => setRankRange(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {RANK_RANGES.map((r) => (
                <option key={r.value || 'all'} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {universities.map((u) => (
              <Link key={u.id} href={`/student/universities/${u.id}`}>
                <article className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <RankBadge rank={u.qs_rank} />
                    <span className="text-sm text-muted-foreground">
                      {getFlagEmoji(u.country_code)} {u.country}
                    </span>
                  </div>
                  <h2 className="font-university-display mb-2 line-clamp-2 text-lg font-bold leading-tight text-foreground group-hover:text-primary">
                    {u.name}
                  </h2>
                  <div className="mb-3">
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>QS Score</span>
                      <span>{u.qs_overall_score.toFixed(1)}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${Math.min(100, u.qs_overall_score)}%` }}
                      />
                    </div>
                  </div>
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {u.type && (
                      <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {u.type}
                      </span>
                    )}
                    {(u.strong_subjects ?? []).slice(0, 2).map((s) => (
                      <span
                        key={s}
                        className="rounded bg-secondary/20 px-2 py-0.5 text-xs text-secondary"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <span className="mt-auto text-sm font-medium text-primary group-hover:underline">
                    Xem chi tiết →
                  </span>
                </article>
              </Link>
            ))}
          </div>
        )}
        {!loading && universities.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">Không tìm thấy trường nào.</p>
        )}
      </main>
    </div>
  );
}
