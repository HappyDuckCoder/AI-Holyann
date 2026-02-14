'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MODAL_ACCENTS = {
  emerald: 'border-l-emerald-500 bg-emerald-500/10',
  violet: 'border-l-violet-500 bg-violet-500/10',
  amber: 'border-l-amber-500 bg-amber-500/10',
  sky: 'border-l-sky-500 bg-sky-500/10',
  rose: 'border-l-rose-500 bg-rose-500/10',
  primary: 'border-l-primary bg-primary/10',
} as const;

export type ModalAccent = keyof typeof MODAL_ACCENTS;

export function ModalSection({
  title,
  children,
  accent = 'primary',
  className,
}: {
  title?: string;
  children: React.ReactNode;
  accent?: ModalAccent;
  className?: string;
}) {
  return (
    <div className={cn('rounded-xl border border-border/60 p-4 border-l-4', MODAL_ACCENTS[accent], className)}>
      {title && <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title}</p>}
      {children}
    </div>
  );
}

export function CollapsibleSection({
  title,
  summary,
  children,
  accent = 'primary',
  defaultOpen = false,
}: {
  title: string;
  summary?: string;
  children: React.ReactNode;
  accent?: ModalAccent;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className={cn('group rounded-xl border border-border/60 border-l-4 overflow-hidden', MODAL_ACCENTS[accent])}
      open={defaultOpen}
    >
      <summary className="list-none cursor-pointer select-none">
        <span className="flex items-center justify-between gap-2 p-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
          {summary && <span className="text-xs text-muted-foreground truncate max-w-[60%]">{summary}</span>}
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
        </span>
      </summary>
      <div className="px-4 pb-4 pt-0">{children}</div>
    </details>
  );
}
