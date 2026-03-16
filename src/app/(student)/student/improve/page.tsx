"use client";

import React from "react";
import Link from "next/link";
import { ServerCrash } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function ImprovePage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background text-foreground p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center text-center max-w-md"
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-orange-500 dark:text-orange-400 ring-1 ring-orange-200 dark:ring-orange-800/50">
          <ServerCrash className="h-10 w-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-foreground">
          Hệ thống đang bảo trì
        </h1>

        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          Tính năng cải thiện hồ sơ (CV và bài luận) đang được bảo trì để nâng cấp chất lượng tốt hơn. <br />
          Vui lòng chờ khoảng <span className="font-semibold text-foreground">1 tuần</span> rồi quay lại.
        </p>

        <Button
          asChild
          className="mt-8 min-h-[48px] px-8 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all duration-200 shadow-md"
        >
          <Link href="/student">Quay lại Dashboard</Link>
        </Button>
      </motion.div>
    </div>
  );
}
