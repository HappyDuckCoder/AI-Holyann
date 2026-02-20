"use client";

import React from "react";

export function ChecklistSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 pb-8 space-y-8" aria-hidden>
      {/* Header skeleton */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex items-center gap-4">
            <div className="h-[72px] w-[72px] rounded-full bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-7 w-32 bg-muted rounded-lg animate-pulse" />
              <div className="h-4 w-64 bg-muted/80 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            <div className="h-2 w-full rounded-full bg-muted animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-muted animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>

        {/* Main content skeleton */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="h-5 w-40 bg-muted rounded mb-4 animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl bg-muted/60 animate-pulse"
                  style={{ animationDelay: `${i * 60}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
