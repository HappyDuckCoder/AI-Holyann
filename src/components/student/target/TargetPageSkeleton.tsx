"use client";

import React from "react";

export function TargetPageSkeleton() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Tabs skeleton */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
        <div className="border-b border-border px-6 py-4 bg-muted/30 flex flex-wrap gap-6">
          <div className="h-5 w-24 rounded bg-muted/70 animate-pulse" />
          <div className="h-5 w-20 rounded bg-muted/70 animate-pulse" />
        </div>
        <div className="p-6">
          <div className="flex gap-2 rounded-xl bg-muted/50 p-1.5 mb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-11 flex-1 rounded-lg bg-muted/60 animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          <ul className="space-y-5">
            {[1, 2, 3].map((i) => (
              <li key={i} className="rounded-2xl border border-border bg-card p-5">
                <div className="h-6 w-48 rounded bg-muted/70 animate-pulse mb-3" />
                <div className="h-4 w-full max-w-md rounded bg-muted/50 animate-pulse mb-2" />
                <div className="h-3 w-20 rounded bg-muted/50 animate-pulse mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                  {[1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="h-20 rounded-xl border border-border bg-muted/30 animate-pulse"
                      style={{ animationDelay: `${(i + j) * 0.05}s` }}
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* History skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="h-5 w-40 rounded bg-muted/60 animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
