"use client";

import React, { useRef, useState, useLayoutEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LeadGenerationModal } from "@/components/landing/LeadGenerationModal";
import { BRAND_COLORS } from "@/lib/data";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const SQ = 0.707; // 1/sqrt(2) for 45°

function useOrbitRadius() {
  const ref = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState(120);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const min = Math.min(width, height);
      const imgSize = Math.min(min * 0.7, 520);
      const r = Math.max(60, (min - imgSize) / 2);
      setRadius(Math.round(r));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, radius };
}

export default function HeroSection() {
  const { ref: flyRef, radius } = useOrbitRadius();
  const orbit = {
    x: [
      radius,
      radius * SQ,
      0,
      -radius * SQ,
      -radius,
      -radius * SQ,
      0,
      radius * SQ,
      radius,
    ],
    y: [
      0,
      radius * SQ,
      radius,
      radius * SQ,
      0,
      -radius * SQ,
      -radius,
      -radius * SQ,
      0,
    ],
  };

  return (
    <section
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-background hero-grid-bg selection:bg-primary/20 selection:text-foreground"
      aria-label="Hero"
    >
      <div
        className="absolute inset-0 pointer-events-none hero-rays"
        aria-hidden
      />
      <div className="relative z-10 w-full container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Text - trái desktop, trên mobile */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            <motion.p
              variants={item}
              className="text-sm text-muted-foreground mb-4"
            >
              Holyann Explore - Nền tảng học tập đồng hành du học cùng bạn
            </motion.p>

            <motion.h1
              variants={item}
              className="flex flex-col gap-2 sm:gap-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6 w-full"
            >
              <span className="text-foreground">Vẽ đường tương lai </span>
              <span className={`${BRAND_COLORS.textGradient}`}>
                Định hình ngày mai
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Đề cao sự tiên phong, sáng tạo và nỗ lực của bạn đồng hành
            </motion.p>

            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                asChild
                size="lg"
                className="h-12 px-8 rounded-full font-semibold border-2 transition-all duration-200 hover:bg-accent/50"
              >
                <Link href="#gioi-thieu">Tìm hiểu thêm</Link>
              </Button>
              <Button
                asChild
                size="lg"
                className={`h-12 px-8 rounded-full font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 ${BRAND_COLORS.primaryGradient}`}
              >
                <Link href="/login">Khám phá ngay</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Image - phải desktop, ẩn trên mobile; bay sát cạnh theo kích thước vùng */}
          <motion.div
            ref={flyRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="hidden md:flex justify-center items-center min-h-[400px] lg:min-h-[560px] overflow-visible"
          >
            <motion.div
              animate={{ x: orbit.x, y: orbit.y }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              className="relative w-[360px] h-[360px] md:w-[440px] md:h-[440px] lg:w-[520px] lg:h-[520px] shrink-0"
            >
              <Image
                src="/images/holi/pencil.png"
                alt="Vẽ đường tương lai - Holyann Explore"
                width={520}
                height={520}
                className="object-contain w-full h-full"
                priority
                sizes="(max-width: 1024px) 440px, 520px"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
