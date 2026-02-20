"use client";

import Register from "@/components/auth/Register";
import { motion } from "framer-motion";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground overflow-hidden">
      {/* Left: Brand panel - same as login */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="hidden sm:flex md:w-[50%] lg:w-[52%] min-h-screen relative flex-col justify-center px-8 lg:px-14 xl:px-20 py-12"
      >
        <div
          className="absolute inset-0 bg-linear-to-br from-primary/8 via-transparent to-secondary/10 dark:from-primary/15 dark:to-secondary/20"
          aria-hidden
        />
        <div
          className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/15 dark:bg-primary/20 blur-[100px] pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-secondary/10 dark:bg-secondary/15 blur-[120px] pointer-events-none"
          aria-hidden
        />
        <div className="relative z-10 max-w-lg">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold tracking-tight text-foreground dark:text-white"
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
            className="mt-5 text-lg text-muted-foreground dark:text-slate-400 max-w-md"
          >
            AI-powered academic platform. Plan, track, and achieve your study
            abroad goals.
          </motion.p>
        </div>
      </motion.div>

      {/* Right: Step-based flow — no card, open layout */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
        className="w-full md:w-[50%] lg:w-[48%] min-h-screen flex flex-col justify-center p-6 sm:p-8 lg:p-12 xl:p-16 bg-background"
      >
        <p className="sm:hidden text-sm text-muted-foreground mb-6">
          AI-powered academic platform
        </p>
        <Register />
      </motion.div>
    </div>
  );
}
