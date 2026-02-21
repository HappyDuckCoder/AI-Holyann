"use client";

import React from "react";

export function ProfilePageSkeleton() {
  return (
    <div className="w-full pb-8 overflow-x-hidden animate-in fade-in duration-200">
      {/* Header skeleton - giống ProfileHeader */}
      <div className="relative rounded-2xl overflow-hidden mb-4 sm:mb-6 lg:mb-8 border border-border/60 bg-muted/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-muted animate-pulse shrink-0" />
            <div className="space-y-2">
              <div className="h-6 w-40 sm:w-48 rounded-md bg-muted animate-pulse" />
              <div className="h-4 w-56 sm:w-64 rounded bg-muted/70 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="h-10 w-32 rounded-xl bg-muted animate-pulse" />
            <div className="h-10 w-28 sm:w-36 rounded-xl bg-muted animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 overflow-hidden">
        {/* Cột trái - PersonalInfoCard skeleton */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          <div className="rounded-2xl border border-border shadow-sm overflow-hidden border-l-4 border-l-muted bg-card">
            <div className="h-20 sm:h-24 bg-muted/40" />
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 relative">
              <div className="flex flex-col items-center -mt-10 sm:-mt-12 mb-3 sm:mb-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted animate-pulse border-4 border-card shadow-lg" />
                <div className="mt-3 h-5 w-28 rounded-lg bg-muted animate-pulse" />
                <div className="mt-1 h-3 w-16 rounded bg-muted/60 animate-pulse" />
              </div>
              <div className="border-t border-border/60 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="h-3 w-24 rounded bg-muted/60 animate-pulse" />
                  <div className="h-6 w-6 rounded-lg bg-muted animate-pulse" />
                </div>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 py-2 px-2 rounded-lg"
                    >
                      <div className="w-8 h-8 rounded-full bg-muted animate-pulse shrink-0" />
                      <div
                        className="h-4 flex-1 rounded bg-muted/70 animate-pulse"
                        style={{ maxWidth: i === 4 ? "90%" : "70%" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải - Academic, Activities, Documents skeletons */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          {/* Academic section */}
          <div className="rounded-2xl border border-border shadow-sm overflow-hidden bg-card">
            <div className="px-4 sm:px-5 py-4 border-b border-border/60">
              <div className="flex justify-between items-center">
                <div className="h-5 w-36 rounded bg-muted animate-pulse" />
                <div className="h-6 w-6 rounded-lg bg-muted animate-pulse" />
              </div>
            </div>
            <div className="p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-16 rounded-lg bg-muted/50 animate-pulse" />
                <div className="h-16 rounded-lg bg-muted/50 animate-pulse" />
              </div>
              <div className="h-20 rounded-lg bg-muted/40 animate-pulse" />
              <div className="flex gap-2">
                <div className="h-9 w-24 rounded-lg bg-muted/50 animate-pulse" />
                <div className="h-9 w-28 rounded-lg bg-muted/50 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Activities section */}
          <div className="rounded-2xl border border-border shadow-sm overflow-hidden bg-card">
            <div className="px-4 sm:px-5 py-4 border-b border-border/60">
              <div className="flex justify-between items-center">
                <div className="h-5 w-28 rounded bg-muted animate-pulse" />
                <div className="h-6 w-6 rounded-lg bg-muted animate-pulse" />
              </div>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex gap-3 p-3 rounded-xl border border-border/60"
                >
                  <div className="h-10 w-10 rounded-lg bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-[75%] rounded bg-muted/70 animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-muted/50 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents section */}
          <div className="rounded-2xl border border-border shadow-sm overflow-hidden bg-card">
            <div className="px-4 sm:px-5 py-4 border-b border-border/60">
              <div className="flex justify-between items-center">
                <div className="h-5 w-32 rounded bg-muted animate-pulse" />
                <div className="h-8 w-24 rounded-lg bg-muted animate-pulse" />
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-20 rounded-xl border border-dashed border-border bg-muted/20 animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
