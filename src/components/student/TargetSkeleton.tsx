"use client";

import React from "react";

export function TargetSkeleton() {
  return (
    <div
      className="grid gap-6 lg:grid-cols-12 animate-in fade-in duration-300"
      aria-hidden
    >
      {/* Left column skeleton: CTA + summary stats */}
      <aside className="space-y-4 lg:col-span-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/70 animate-pulse" />
            <div className="min-w-0 space-y-2">
              <div className="h-4 w-32 rounded bg-muted/70 animate-pulse" />
              <div className="h-3 w-40 rounded bg-muted/60 animate-pulse" />
              <div className="h-3 w-24 rounded bg-muted/50 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="h-3 w-28 rounded bg-muted/70 animate-pulse" />
          <div className="mt-3 grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-muted/40 p-3 flex flex-col items-center gap-1 animate-pulse"
              >
                <div className="h-5 w-10 rounded bg-muted/70" />
                <div className="h-2 w-12 rounded bg-muted/60" />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Right column skeleton: recommendation card with tabs + list */}
      <div className="lg:col-span-8">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
          {/* Header row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-4 w-40 rounded bg-muted/70 animate-pulse" />
              <div className="h-3 w-56 rounded bg-muted/60 animate-pulse" />
            </div>
            <div className="h-10 w-40 rounded-xl bg-primary/40 animate-pulse" />
          </div>

          {/* Tabs skeleton */}
          <div className="flex gap-2 rounded-xl bg-muted/30 p-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-lg border border-transparent bg-muted/50 h-9 animate-pulse"
              />
            ))}
          </div>

          {/* University list skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2 animate-pulse"
              >
                <div className="flex justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-48 rounded bg-muted/70" />
                    <div className="flex flex-wrap gap-2">
                      <div className="h-3 w-20 rounded bg-muted/60" />
                      <div className="h-3 w-16 rounded bg-muted/60" />
                      <div className="h-3 w-16 rounded bg-muted/60" />
                    </div>
                  </div>
                  <div className="h-4 w-20 rounded bg-muted/60" />
                </div>
                <div className="h-3 w-[80%] rounded bg-muted/50" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

