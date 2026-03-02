'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const REGIONS = [
  { value: '', label: 'All' },
  { value: 'Asia', label: 'Asia' },
  { value: 'Europe', label: 'Europe' },
  { value: 'North America', label: 'North America' },
  { value: 'Oceania', label: 'Oceania' },
  { value: 'Latin America', label: 'Latin America' },
  { value: 'Middle East & Africa', label: 'Middle East & Africa' },
];

const RANK_RANGES = [
  { value: '', label: 'All', min: 1, max: 100 },
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
  id: string;
  qs_rank: number;
  name: string;
  country: string;
  country_code: string;
  city: string;
  region: string;
  type: string;
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

export default function UniversitiesPage() {
  const { data: session, status } = useSession();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState('');
  const [rankRange, setRankRange] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (searchInput.trim()) p.set('search', searchInput.trim());
    if (region) p.set('region', region);
    const range = RANK_RANGES.find((r) => r.value === rankRange);
    if (range && range.value) {
      p.set('minRank', String(range.min));
      p.set('maxRank', String(range.max));
    }
    return p.toString();
  }, [searchInput, region, rankRange]);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already applied via searchInput in params
  };

  const backHref = status === 'authenticated' && session?.user ? '/student/dashboard' : '/';
  const backLabel = status === 'authenticated' && session?.user ? 'Quay về Dashboard' : 'Trang chủ';

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap"
        rel="stylesheet"
      />

      {/* Top bar: back + theme */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/98 px-4 py-3 backdrop-blur sm:px-6 md:px-8">
        <Link
          href={backHref}
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          ← {backLabel}
        </Link>
        <ThemeToggle variant="icon" className="text-foreground hover:text-primary" />
      </div>

      {/* Hero */}
      <header className="relative border-b border-border bg-linear-to-b from-primary/10 to-transparent px-4 py-12 sm:px-6 md:px-8">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_50%,var(--primary)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,var(--secondary)_0%,transparent_40%)]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <h1
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            World&apos;s Best Universities
          </h1>
          <p className="mt-3 text-muted-foreground sm:text-lg">
            Curated from QS World University Rankings 2024
          </p>
          <a
            href="https://www.topuniversities.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            topuniversities.com
            <span aria-hidden>→</span>
          </a>
        </div>
      </header>

      {/* Sticky filter bar */}
      <div className="sticky top-14 z-10 border-b border-border bg-background/95 px-4 py-4 backdrop-blur sm:px-6 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <input
              type="search"
              placeholder="Search MIT, Oxford, Tokyo..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full max-w-md rounded-lg border border-border bg-card px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </form>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Region
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
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Rank
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

      {/* Grid */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {universities.map((u) => (
              <Link key={u.id} href={`/universities/${u.id}`}>
                <article
                  className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <RankBadge rank={u.qs_rank} />
                    <span className="text-sm text-muted-foreground">
                      {getFlagEmoji(u.country_code)} {u.country}
                    </span>
                  </div>
                  <h2
                    className="mb-2 line-clamp-2 text-lg font-bold leading-tight text-foreground group-hover:text-primary"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
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
                    <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {u.type}
                    </span>
                    {u.strong_subjects.slice(0, 2).map((s) => (
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

      {/* Footer disclaimer */}
      <footer className="border-t border-border px-4 py-6 sm:px-6 md:px-8">
        <div className="mx-auto max-w-4xl text-center text-sm text-muted-foreground">
          ⚠️ Dữ liệu tham khảo từ QS World University Rankings 2024 (topuniversities.com).
          Thứ hạng và điểm số phản ánh bảng xếp hạng chính thức của QS Quacquarelli Symonds
          Limited.
        </div>
      </footer>
    </div>
  );
}
