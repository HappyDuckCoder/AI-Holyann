"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ImageIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const HERO_CARD_IMAGES = [
  "/images/landing/hero-card-1.jpg",
  "/images/landing/hero-card-2.jpg",
  "/images/landing/hero-card-3.jpg",
  "/images/landing/hero-card-4.jpg",
];

const bentoLabels = ["Hồ sơ", "AI hỗ trợ", "Target trường", "Mentor"];

function HeroCard({
  imageSrc,
  label,
  delay,
}: {
  imageSrc: string;
  label: string;
  delay: number;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const showPlaceholder = !imgLoaded || imgError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2 }}
      className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 select-none border border-slate-200/80 transition-shadow hover:shadow-lg"
    >
      {showPlaceholder ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
          <ImageIcon className="h-10 w-10 sm:h-12 sm:w-12" strokeWidth={1.5} />
          <span className="text-xs font-medium">Thêm ảnh</span>
          <span className="text-[10px] text-slate-400/80 px-2 text-center">
            {label}
          </span>
        </div>
      ) : null}
      <img
        src={imageSrc}
        alt={label}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${showPlaceholder ? "opacity-0" : "opacity-100"}`}
        onLoad={() => setImgLoaded(true)}
        onError={() => setImgError(true)}
      />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
        <span className="text-white font-semibold text-sm sm:text-base drop-shadow-sm">
          {label}
        </span>
      </div>
    </motion.div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-white selection:bg-sky-200 selection:text-slate-900">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-0 right-0 h-[70vh] max-h-[600px] bg-gradient-to-b from-sky-50/90 via-cyan-50/50 to-transparent" />
        <div className="absolute top-[15%] right-0 w-[50vw] max-w-[600px] h-[400px] bg-gradient-to-l from-cyan-100/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] left-0 w-[40vw] max-w-[400px] h-[300px] bg-gradient-to-r from-sky-100/30 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            <motion.p
              variants={item}
              className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-sky-600 mb-6 select-text"
            >
              Holyann Explore
            </motion.p>

            <motion.h1
              variants={item}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6 select-text"
            >
              <span className="block">Vẽ đường tương lai.</span>
              <span className="block bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">
                Định hình ngày mai.
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="text-lg sm:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed select-text"
            >
              Nền tảng đồng hành du học toàn diện — từ hồ sơ, bài test đến gợi ý
              trường và kết nối mentor. Một chìa khóa cho thành công của bạn.
            </motion.p>

            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                asChild
                size="lg"
                className="rounded-full h-12 px-8 text-base font-semibold bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 transition-shadow duration-200"
              >
                <Link href="/dashboard" className="inline-flex items-center gap-2">
                  Khám phá ngay
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full h-12 px-8 text-base font-semibold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:border-sky-300 transition-colors duration-200"
                onClick={() =>
                  document.getElementById("gioi-thieu")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Tìm hiểu thêm
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 gap-4 sm:gap-5 max-w-md mx-auto lg:max-w-none lg:mx-0"
          >
            {HERO_CARD_IMAGES.map((src, i) => (
              <HeroCard
                key={i}
                imageSrc={src}
                label={bentoLabels[i]}
                delay={0.3 + i * 0.06}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
