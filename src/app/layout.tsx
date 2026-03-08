import type { Metadata } from "next";
import { Be_Vietnam_Pro, Nunito, Playfair_Display } from "next/font/google";
import AuthProvider from "@/components/auth/AuthProvider";
import NextAuthErrorBoundary from "@/components/auth/NextAuthErrorBoundary";
import { ToasterProvider } from "@/components/ui/ToasterProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ThemeScript } from "@/components/theme/ThemeScript";
import "./globals.css";

/**
 * FONT SYSTEM — Vietnamese-first
 * ──────────────────────────────────────────────────────────────
 * Be Vietnam Pro  → Primary UI / body  (tối ưu cho tiếng Việt,
 *                   thiết kế bởi người Việt, dấu thanh cực đẹp)
 * Nunito          → Headings / display  (rounded, friendly,
 *                   hỗ trợ đầy đủ Latin Extended = tiếng Việt)
 * Playfair Display → Decorative / hero italic  (serif sang trọng)
 * ──────────────────────────────────────────────────────────────
 */

/** Body + UI — Be Vietnam Pro: bộ dấu tiếng Việt hoàn hảo */
const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

/** Headings / section titles — Nunito: bo tròn, thân thiện */
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

/** Decorative / display serif */
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const fontVariables = [
  beVietnamPro.variable,
  nunito.variable,
  playfair.variable,
].join(" ");

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://holyann.com",
  ),
  title: {
    default: "Holyann Explore (HOEX) - Nền Tảng AI Hỗ Trợ Du Học Toàn Diện",
    template: "%s | Holyann Explore",
  },
  description:
    "Nền tảng AI hỗ trợ du học toàn diện với phân tích hồ sơ SWOT, bài test RIASEC/MBTI/Grit Scale, gợi ý trường DREAM/MATCH/SAFETY, tư vấn trực tiếp với mentor, và cải thiện CV/luận văn.",
  keywords: [
    "du học",
    "study abroad",
    "AI du học",
    "tư vấn du học",
    "học bổng",
    "RIASEC",
    "MBTI",
    "Grit Scale",
    "SWOT analysis",
    "Holyann",
    "HOEX",
    "du học Mỹ",
    "du học Châu Á",
    "du học Châu Âu",
  ],
  authors: [{ name: "HolyAnn Team" }],
  creator: "HolyAnn",
  publisher: "HolyAnn",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    siteName: "Holyann Explore",
    title: "Holyann Explore (HOEX) - Nền Tảng AI Hỗ Trợ Du Học Toàn Diện",
    description:
      "Nền tảng AI hỗ trợ du học toàn diện với phân tích hồ sơ SWOT, bài test RIASEC/MBTI/Grit Scale, gợi ý trường DREAM/MATCH/SAFETY, tư vấn trực tiếp với mentor, và cải thiện CV/luận văn.",
    images: [
      {
        url: "/images/logos/logo HoEx (3).png",
        width: 1200,
        height: 630,
        alt: "Holyann Explore Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Holyann Explore (HOEX) - Nền Tảng AI Hỗ Trợ Du Học Toàn Diện",
    description:
      "Nền tảng AI hỗ trợ du học toàn diện với phân tích hồ sơ SWOT, bài test RIASEC/MBTI/Grit Scale, gợi ý trường DREAM/MATCH/SAFETY, tư vấn trực tiếp với mentor, và cải thiện CV/luận văn.",
    images: ["/images/logos/logo HoEx (3).png"],
    creator: "@holyann",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/images/logos/Logo Holyann nhỏ.png",
    shortcut: "/images/logos/Logo Holyann nhỏ.png",
    apple: "/images/logos/Logo Holyann nhỏ.png",
  },
  manifest: "/manifest.json",
  alternates: { canonical: "/" },
  category: "Education",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <link
          rel="icon"
          href="/images/logos/Logo Holyann nhỏ.png"
          type="image/png"
        />
        <link
          rel="apple-touch-icon"
          href="/images/logos/Logo Holyann nhỏ.png"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${fontVariables} antialiased font-sans transition-colors duration-300`}
      >
        <ThemeProvider>
          <AuthProvider>
            <NextAuthErrorBoundary>{children}</NextAuthErrorBoundary>
          </AuthProvider>
        </ThemeProvider>
        <ToasterProvider />
      </body>
    </html>
  );
}
