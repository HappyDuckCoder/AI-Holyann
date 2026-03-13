"use client";
import React from "react";
import { Mail, Facebook, Instagram, ChevronRight } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTiktok } from "@fortawesome/free-brands-svg-icons";
import { BRAND_COLORS, NAV_LINKS } from "../../lib/data";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="bg-(--footer-bg) text-slate-300 py-20 border-t border-slate-800/50"
    >
      <div className="container mx-auto px-6">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Cột 1: Thông tin thương hiệu - Chiếm 5 cột trên màn lớn */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2">
              <span
                className={`text-3xl font-black tracking-tighter ${BRAND_COLORS.textGradient}`}
              >
                HOLYANN
              </span>
              <span className="text-3xl font-light tracking-widest text-white/90">
                EXPLORE
              </span>
            </div>

            <p className="text-slate-400 text-base leading-relaxed max-w-md">
              <span className="text-white font-medium">Future by Design</span> —
              Vẽ đường tương lai, định hình ngày mai. Chúng tôi tận tâm đồng
              hành cùng thế hệ trẻ Việt Nam trên hành trình chinh phục những học
              bổng danh giá nhất thế giới.
            </p>

            {/* Social Icons - Thiết kế lại dạng Glassmorphism */}

          </div>

          {/* Cột 2: Liên hệ nhanh - Chiếm 4 cột */}
          <div className="lg:col-span-4">
            <h4 className="text-white font-bold mb-8 uppercase tracking-[0.2em] text-xs">
              Thông Tin Liên Hệ
            </h4>
            <ul className="space-y-5">
              {[
                {
                  icon: <Mail size={18} />,
                  text: "holyann.contact@gmail.com",
                  href: "mailto:holyann.contact@gmail.com",
                  hoverClass: "group-hover:bg-red-500 group-hover:border-red-400 text-slate-500 group-hover:text-white",
                },
                {
                  icon: <Facebook size={18} />,
                  text: "Holyann Explore",
                  href: "https://www.facebook.com/holyannxplore",
                  hoverClass: "group-hover:bg-blue-600 group-hover:border-blue-500 text-slate-500 group-hover:text-white",
                },
                {
                  icon: <Instagram size={18} />,
                  text: "@holyannexplore",
                  href: "https://www.instagram.com/holyannexplore/",
                  hoverClass: "group-hover:bg-gradient-to-tr group-hover:from-yellow-500 group-hover:via-red-500 group-hover:to-purple-500 group-hover:border-transparent text-slate-500 group-hover:text-white",
                },
                {
                  icon: <FontAwesomeIcon icon={faTiktok} />,
                  text: "@holyannexplore",
                  href: "https://www.tiktok.com/@holyannexplore",
                  hoverClass: "group-hover:bg-black group-hover:border-slate-800 text-slate-500 group-hover:text-white",
                },
              ].map((item, idx) => (
                <li key={idx}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    <span className={`w-11 h-11 rounded-xl bg-slate-800/50 border border-slate-700/50 flex shrink-0 items-center justify-center transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-lg group-hover:shadow-cyan-500/20 ${item.hoverClass}`}>
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium tracking-wide">
                      {item.text}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Liên kết nhanh - Chiếm 3 cột */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold mb-8 uppercase tracking-[0.2em] text-xs">
              Khám Phá
            </h4>
            <ul className="grid grid-cols-1 gap-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-all"
                  >
                    <ChevronRight
                      size={14}
                      className="text-cyan-500 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all"
                    />
                    <span className="group-hover:translate-x-1 transition-transform">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright Bar - Thiết kế lại tinh tế hơn */}
        <div className="mt-20 pt-8 border-t border-slate-800/60">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[11px] tracking-wider text-slate-500 uppercase">
              © 2025 <span className="text-slate-300">Holyann Explore</span>.
              All Rights Reserved.
            </div>

            <div className="flex items-center gap-8">
              <p className="text-[10px] text-slate-600 italic">
                Crafted with passion for future leaders
              </p>
              <div className="h-4 w-[1px] bg-slate-800 hidden md:block"></div>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="text-[10px] uppercase tracking-widest text-cyan-500 hover:text-white transition-colors"
              >
                Back to top ↑
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
