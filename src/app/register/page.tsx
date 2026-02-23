"use client";

import Register from "@/components/auth/Register";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { motion } from "framer-motion";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground overflow-x-hidden overflow-y-auto transition-colors duration-300 dark:auth-page-grid">
      {/* Left: Marketing section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex md:w-[50%] lg:w-[52%] min-h-[40vh] md:min-h-screen relative flex-col justify-center px-6 sm:px-8 lg:px-14 xl:px-20 py-10 md:py-12 shrink-0"
      >
        <div
          className="absolute inset-0 bg-linear-to-br from-primary/6 via-transparent to-secondary/8 dark:from-primary/12 dark:via-transparent dark:to-secondary/15"
          aria-hidden
        />
        <div
          className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/12 dark:bg-primary/15 blur-[100px] pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-secondary/8 dark:bg-secondary/12 blur-[120px] pointer-events-none"
          aria-hidden
        />
        <div className="relative z-10 max-w-lg">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-foreground dark:text-white drop-shadow-sm"
          >
            Your path to{" "}
            <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent dark:from-primary dark:to-secondary">
              global education
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="mt-4 md:mt-5 text-base sm:text-lg text-muted-foreground dark:text-slate-300 max-w-md leading-relaxed"
          >
            AI-powered academic platform. Plan, track, and achieve your study
            abroad goals.
          </motion.p>
        </div>
      </motion.div>

      {/* Divider between left and right (hidden in dark mode) */}
      <div className="hidden md:block dark:hidden w-px min-h-screen bg-border/50 shrink-0" aria-hidden />

      {/* Right: Auth section */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
        className="w-full md:w-[50%] lg:w-[48%] min-h-[60vh] md:min-h-screen flex flex-col justify-center items-center p-6 sm:p-8 lg:p-12 xl:p-16 bg-background relative"
      >
        <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
          <ThemeToggle variant="icon" className="rounded-full border border-border bg-muted/30 hover:bg-muted/50" />
        </div>
        <div className="w-full max-w-[400px]">
          <Register />
        </div>
      </motion.div>
    </div>
  );
}
