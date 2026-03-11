'use client';

import { useEffect } from 'react';
import { ServerCrash } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center text-center max-w-md"
      >
        {/* Icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-orange-500 dark:text-orange-400 ring-1 ring-orange-200 dark:ring-orange-800/50">
          <ServerCrash className="h-10 w-10" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-foreground">
          Hệ thống đang bảo trì
        </h1>

        {/* Description */}
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          Server đang bảo trì, vui lòng chờ khoảng{' '}
          <span className="font-semibold text-foreground">1 tiếng</span> rồi quay lại.
        </p>

        {/* Retry button */}
        <button
          onClick={reset}
          className="mt-8 flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all duration-200"
        >
          Thử lại
        </button>

        {/* Error digest (dev only) */}
        {process.env.NODE_ENV === 'development' && error?.digest && (
          <p className="mt-4 text-xs text-muted-foreground/60 font-mono">
            digest: {error.digest}
          </p>
        )}
      </motion.div>
    </div>
  );
}
