"use client";
import React from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";

// Helper để lấy URL ảnh cờ (sử dụng mã ISO 3166-1 alpha-2)
const getFlagUrl = (code: string) =>
  `https://flagcdn.com/w80/${code.toLowerCase()}.png`;

const ACHIEVEMENTS = [
  {
    number: "01",
    label: "Học bổng chính phủ",
    caption: "ROMANIA",
    visual: {
      type: "flags",
      flags: [{ code: "ro", name: "Romania" }],
      label: "ROMANIA",
    },
  },
  {
    number: "02",
    label: "Học bổng toàn phần",
    caption: "Người Việt Nam đầu tiên đạt học bổng này",
    visual: {
      type: "flags",
      flags: [
        { code: "us", name: "Purdue" },
        { code: "us", name: "Sewanee" },
      ],
      // Bạn có thể thay getFlagUrl bằng link logo trường nếu có
      schools: ["Purdue University", "Sewanee"],
    },
  },
  {
    number: "05",
    label: "Học bổng toàn học phí",
    caption: "", // Để trống theo thiết kế ảnh
    visual: {
      type: "flags",
      flags: [
        { code: "kr", name: "Yonsei" },
        { code: "hk", name: "HKUST" },
        { code: "vn", name: "Fulbright" },
        { code: "vn", name: "VinUni" },
      ],
      schools: ["Yonsei", "HKUST", "Fulbright", "VinUni"],
    },
  },
  {
    number: "09",
    label: "Quốc gia trúng tuyển",
    caption: "",
    visual: {
      type: "globe",
      flags: [
        { code: "sg", name: "Singapore" },
        { code: "it", name: "Italy" },
        { code: "ro", name: "Romania" },
        { code: "us", name: "USA" },
        { code: "kr", name: "Korea" },
        { code: "hk", name: "Hong Kong" },
        { code: "vn", name: "Vietnam" },
        { code: "tw", name: "Taiwan" },
        { code: "jp", name: "Japan" },
      ],
    },
  },
  {
    number: "100%",
    label: "Học viên trúng tuyển",
    caption: "",
    visual: {
      type: "trophy", // Có thể thay bằng mascot nếu bạn có file ảnh nhân vật giọt nước
    },
  },
];

export default function AchievementsSection() {
  return (
    <section
      id="thanh-tich"
      className="py-24 scroll-mt-24 overflow-hidden relative bg-slate-900 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px] text-white"
    >
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="mb-4">
          <SectionHeading subtitle="Holie shinning stars" dark={true}>
            Dấu Ấn Thành Công năm 2024-2025
          </SectionHeading>
        </div>
        <p className="text-slate-400 mb-14 max-w-2xl mx-auto text-sm leading-relaxed">
          Học viên Holyann đã ghi dấu ấn với các học bổng danh giá và tỉ lệ
          trúng tuyển ấn tượng trong năm học 2024–2025.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {ACHIEVEMENTS.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.55,
                delay: idx * 0.09,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group"
            >
              <div className="relative h-full rounded-2xl overflow-hidden flex flex-col transition-colors border border-slate-700/60 shadow-xl bg-slate-800">
                <div className="h-1 w-full bg-cyan-400/70" />

                <div className="flex flex-col flex-1 p-5 gap-4">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <span className="text-[10px] font-semibold tracking-[0.3em] text-slate-400 uppercase">
                      Thành tích
                    </span>
                    <span className="text-5xl font-black leading-none drop-shadow-sm text-cyan-400">
                      {item.number}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide whitespace-pre-line text-center leading-tight mt-1 text-slate-300">
                      {item.label}
                    </span>
                  </div>

                  <div className="flex-1 flex items-center justify-center min-h-[110px] rounded-xl p-3 bg-slate-900/50 border border-slate-700/50">
                    <VisualContent item={item} />
                  </div>

                  <p className="text-[9px] font-semibold tracking-[0.25em] text-slate-400 uppercase text-center mt-auto">
                    {item.caption || "\u00A0"}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VisualContent({ item }: { item: any }) {
  const { visual } = item;

  if (visual.type === "flags" && visual.flags?.length === 1) {
    return (
      <div className="flex flex-col items-center gap-2">
        <img
          src={getFlagUrl(visual.flags[0].code)}
          alt={visual.flags[0].name}
          className="w-14 h-auto rounded border border-slate-700 shadow-lg"
        />
        {visual.label && (
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400">
            {visual.label}
          </span>
        )}
      </div>
    );
  }

  if (visual.type === "flags" && visual.flags?.length === 2) {
    return (
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="flex gap-3">
          {visual.flags.map((f: any, i: number) => (
            <img
              key={i}
              src={getFlagUrl(f.code)}
              alt={f.name}
              className="w-10 h-auto rounded border border-slate-700 shadow-lg"
            />
          ))}
        </div>
        {visual.schools && (
          <div className="flex flex-col gap-1 w-full">
            {visual.schools.map((s: string) => (
              <span
                key={s}
                className="text-[9px] font-medium border rounded-full px-2 py-0.5 text-center text-slate-400 bg-slate-800 border-slate-700"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (visual.type === "flags" && visual.flags?.length > 2) {
    return (
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="flex flex-wrap justify-center gap-2">
          {visual.flags?.map((f: any, i: number) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <img
                src={getFlagUrl(f.code)}
                alt={f.name}
                className="w-7 h-auto rounded-sm border border-slate-800"
              />
              <span className="text-[8px] text-slate-400">{f.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visual.type === "globe") {
    return (
      <div className="grid grid-cols-3 gap-1.5 w-full">
        {visual.flags?.map((f: any, i: number) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1 rounded-lg py-1.5 border transition-colors bg-slate-800 border-slate-700 hover:border-cyan-400/30"
          >
            <img
              src={getFlagUrl(f.code)}
              alt={f.name}
              className="w-5 h-auto rounded-xs shadow-sm"
            />
            <span className="text-[7px] leading-tight text-center text-slate-400">
              {f.name}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (visual.type === "trophy") {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative flex items-center justify-center w-14 h-14 rounded-full border bg-cyan-400/10 border-cyan-400/30">
          <Trophy className="w-7 h-7 text-cyan-400" />
        </div>
        <span className="text-[10px] font-semibold tracking-wide text-slate-400">
          All admitted
        </span>
      </div>
    );
  }

  return null;
}
