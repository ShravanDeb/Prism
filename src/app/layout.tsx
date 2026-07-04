import type { Metadata } from "next";
import { Source_Sans_3, JetBrains_Mono, Petrona, Azeret_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const sourceSans = Source_Sans_3({ subsets: ["latin"], display: "swap", variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-mono" });
const petrona = Petrona({ subsets: ["latin"], display: "swap", variable: "--font-display" });
const azeretMono = Azeret_Mono({ subsets: ["latin"], display: "swap", variable: "--font-label", weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  title: "PRISM — Professional Resume Intelligence & Skill Matcher",
  description: "AI-powered resume tailoring, ATS scoring, and cover letter generation",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sourceSans.variable} ${jetbrainsMono.variable} ${petrona.variable} ${azeretMono.variable} font-sans`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
