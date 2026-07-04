"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Star, Sparkles, X, Sun, Moon, CheckCircle } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { LogoIcon } from "@/components/LogoIcon";

const GITHUB_URL = "https://github.com/ShravanDeb/Prism";
const STAR_COUNT = "0";

const navLinks = [
  { label: "Docs" },
  { label: "About" },
  { label: "Blog" },
];

function FunkyShape({ className }: { className: string }) {
  return <div className={`border-2 border-ink ${className}`} aria-hidden="true" />;
}

function CTAButton({ href, children, className = "", ...props }: { href: string; children: React.ReactNode; className?: string; [key: string]: any }) {
  const base = "flex transition-all text-center justify-center font-medium font-mono uppercase tracking-wide items-center duration-150 border-2 border-ink rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] active:-translate-x-[2px] active:-translate-y-[2px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7c3aed]";
  return (
    <Link href={href} className={`${base} ${className}`} {...props}>
      {children}
    </Link>
  );
}

function HeroGraphic() {
  return (
    <div className="relative mx-auto max-w-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed]/5 via-transparent to-[#7c3aed]/5 blur-3xl" />
      <div className="relative border-2 border-ink bg-canvas-alt shadow-[8px_8px_0px_0px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-ink bg-canvas">
          <div className="w-3 h-3 rounded-full bg-[#dc2626]" />
          <div className="w-3 h-3 rounded-full bg-[#0284c7]" />
          <div className="w-3 h-3 rounded-full bg-[#059669]" />
          <div className="ml-4 px-3 py-1 bg-canvas-alt border-2 border-ink text-xs font-mono text-ink-soft">master-resume.pdf</div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-[#7c3aed] bg-[#7c3aed]/10 flex items-center justify-center">
              <LogoIcon size={18} className="text-[#7c3aed]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-ink">Senior Frontend Engineer</div>
              <div className="text-xs text-ink-soft font-mono">Acme Corp &bull; San Francisco, CA</div>
            </div>
            <div className="ml-auto px-3 py-1 bg-[#059669]/10 border-2 border-[#059669] text-[#059669] text-xs font-mono font-bold">92% Match</div>
          </div>
          <div className="space-y-2 pl-13">
            {["Led migration from Angular to React, reducing bundle size by 60%", "Architected component library used by 12 teams across the org", "Improved Core Web Vitals by 45%, lifting search rankings"].map((bullet, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle size={12} className="text-[#059669] mt-1 shrink-0" />
                <span className={`text-xs ${i === 0 ? "text-ink" : "text-ink-soft"}`}>{bullet}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
              <div className="h-full w-[92%] bg-[#059669] rounded-full" />
            </div>
            <span className="text-xs font-mono text-[#059669] font-bold">ATS: A+</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollY = useRef(0);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    let ticking = false;
    const update = () => {
      const current = window.scrollY;
      if (current < 100) {
        nav.style.transform = "translateY(0)";
      } else if (current > lastScrollY.current) {
        nav.style.transform = "translateY(-100%)";
      } else {
        nav.style.transform = "translateY(0)";
      }
      lastScrollY.current = current;
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.documentElement.classList.add("overflow-hidden");
    } else {
      document.documentElement.classList.remove("overflow-hidden");
    }
  }, [mobileOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink font-sans">
      {/* Navbar */}
      <nav ref={navRef} id="main-nav" className="fixed top-0 left-0 right-0 z-30 py-4 px-3 md:px-6 transition-transform duration-300">
        <div className="max-w-6xl mx-auto bg-canvas-alt border-2 border-ink shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] px-5 py-3 md:px-8 md:py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center group">
              <div className="bg-canvas-alt text-ink px-3 py-2 border-2 border-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] group-hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] transition-all flex items-center gap-2">
                <LogoIcon size={22} />
                <span className="text-base md:text-lg uppercase font-label font-semibold tracking-[0.08em] hidden md:block">PRISM</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <span key={link.label}
                  className="text-base font-medium text-ink px-3 py-2 transition-all border-2 border-transparent cursor-default"
                >
                  {link.label}
                </span>
              ))}
              <button onClick={toggle} className="p-2 border-2 border-ink bg-canvas-alt hover:bg-canvas transition-all shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px]" aria-label="Toggle theme">
                {theme === "dark" ? <Sun size={18} className="text-[#0284c7]" /> : <Moon size={18} className="text-[#7c3aed]" />}
              </button>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer"
                className="flex transition-all text-center justify-center font-medium font-label uppercase tracking-wide items-center duration-150 border-2 border-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] rounded-none hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] active:-translate-x-[2px] active:-translate-y-[2px] text-white bg-[#7c3aed] hover:bg-[#6d28d9] h-10 px-4 py-2 text-sm"
              >
                <svg viewBox="0 0 16 16" className="w-4 h-4 mr-1.5 fill-white" aria-hidden="true">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8" />
                </svg>
                GitHub
              </a>
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex items-center gap-2 text-base font-bold text-ink px-4 py-3 border-2 border-ink bg-[#0284c7] shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
              aria-label="Open menu"
            >
              {mobileOpen ? <X size={20} /> : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              )}
              <span>Menu</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="h-28 md:h-24" />

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/40" role="dialog" aria-modal="true" onClick={() => setMobileOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="fixed inset-x-3 top-3 bg-canvas-alt border-2 border-ink shadow-[8px_8px_0px_0px_rgba(0,0,0,0.25)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-ink">
              <Link href="/" className="flex items-center" onClick={() => setMobileOpen(false)}>
                  <div className="bg-canvas-alt text-ink px-3 py-2 border-2 border-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] flex items-center gap-2">
                    <LogoIcon size={20} />
                    <span className="text-base uppercase font-label font-semibold tracking-[0.08em]">PRISM</span>
                </div>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-3 text-white bg-black border-2 border-ink hover:bg-[#dc2626] transition" aria-label="Close menu">
                <X size={24} />
              </button>
            </div>
            <nav className="px-5 py-6">
              <ul className="space-y-3">
                {navLinks.map((link, i) => (
                  <li key={link.label}>
                    <span
                      className={`flex items-center px-4 py-4 text-xl text-ink border-2 border-ink shadow-[4px_4px_0_rgba(0,0,0,0.25)] cursor-default ${i % 2 === 0 ? "bg-[#0284c7]/20" : "bg-[#7c3aed]/20"}`}
                    >
                      {link.label}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 space-y-3">
                <button onClick={() => { toggle(); setMobileOpen(false); }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-label uppercase tracking-wider border-2 border-ink bg-canvas hover:bg-canvas-alt transition-all"
                >
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer"
                  className="flex transition-all text-center justify-center font-medium font-label uppercase tracking-wide items-center duration-150 border-2 border-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] rounded-none hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] text-white bg-[#7c3aed] hover:bg-[#6d28d9] h-13 px-6 py-3 text-base w-full justify-center"
                >
                  <svg viewBox="0 0 16 16" className="w-5 h-5 mr-2 fill-white" aria-hidden="true">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8" />
                  </svg>
                    GitHub
                </a>
              </div>
            </nav>
          </div>
        </div>
      )}

      <main>
        {/* Hero - Indigo accent */}
        <section className="relative overflow-hidden border-y-2 border-ink">
          <div className="max-w-6xl mx-auto px-4 md:px-8 pt-12 pb-16 md:pt-20 md:pb-24">
            <div className="grid lg:grid-cols-5 gap-12 items-center">
              <div className="lg:col-span-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 border-2 border-ink bg-canvas-alt text-xs font-label uppercase tracking-wider text-ink-soft shadow-[3px_3px_0_rgba(0,0,0,0.25)] mb-8">
                  <Sparkles size={12} className="text-[#7c3aed]" />
                  AI-Powered &bull; Open Source &bull; Actually Free
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-ink leading-[1.15] tracking-tight mb-6 font-display">
                  <s className="decoration-ink decoration-2">Manual</s> <span className="bg-[#7c3aed] text-white px-3 inline-block shadow-[3px_3px_0_rgba(0,0,0,0.25)]">Smart</span>.
                  <br />
                  <s className="decoration-ink decoration-2">Tweak</s> <span className="bg-[#0284c7] text-white px-3 inline-block shadow-[3px_3px_0_rgba(0,0,0,0.25)]">Tailor</span>.
                  <br />
                  <span className="text-[#7c3aed] relative">
                    Automated.
                    <span className="absolute -bottom-1 left-0 right-0 h-1 bg-[#7c3aed]/20" />
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-ink-soft max-w-xl leading-relaxed mb-8">
                  Job hunting is already a full-time job. Let PRISM clock in — upload your resume once, paste any JD, and get tailored resumes, ATS scores, and cover letters on autopilot.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/login"
                    className="text-white bg-[#7c3aed] hover:bg-[#6d28d9] h-13 px-6 py-3 text-base shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.25)] inline-flex items-center gap-2 transition-all duration-150 border-2 border-ink rounded-none font-medium font-mono uppercase tracking-wide"
                  >
                    Get Started <ArrowRight size={20} />
                  </Link>
                  <CTAButton href={GITHUB_URL}
                    className="border-2 border-ink bg-canvas-alt text-ink hover:bg-canvas h-13 px-6 py-3 text-base shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.25)] inline-flex items-center gap-2"
                  >
                    <Star size={18} /> Star on GitHub
                  </CTAButton>
                </div>
              </div>
              <div className="lg:col-span-2">
                <HeroGraphic />
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b-2 border-ink bg-canvas-alt">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "Upload", label: "Once" },
                { value: "Match", label: "Any JD" },
                { value: "Tailor", label: "Instantly" },
                { value: "Apply", label: "Confidently" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl text-ink font-bold tracking-tight">{stat.value}</div>
                  <div className="text-xs font-label uppercase tracking-wider text-ink-soft mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works - Indigo step boxes */}
        <section className="border-b-2 border-ink">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-20 md:py-28">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 border-2 border-ink bg-canvas-alt text-xs font-label uppercase tracking-wider text-ink-soft shadow-[3px_3px_0_rgba(0,0,0,0.25)] mb-6">
                The Process
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl text-ink leading-tight tracking-tight font-display">
                Three steps. <s className="decoration-[#0284c7] decoration-2">No sweat.</s> <span className="bg-[#7c3aed] text-white px-3 inline-block shadow-[3px_3px_0_rgba(0,0,0,0.25)]">That&apos;s it.</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              {[
                { num: "01", title: "Dump Your Master Resume", desc: "Toss us your PDF or DOCX. PRISM chews through it, extracts every section, and keeps it as your single source of truth." },
                { num: "02", title: "Drop the Job Description", desc: "Paste any JD. PRISM digs through the requirements and surfaces every keyword that matters." },
                { num: "03", title: "Generate & Conquer", desc: "Spit out a tailored resume, ATS score, and cover letter. Time to hit apply with actual confidence." },
              ].map((step, i) => (
                <div key={step.num} className="relative">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 border-2 border-ink bg-[#7c3aed] flex items-center justify-center shadow-[3px_3px_0_rgba(0,0,0,0.25)]">
                      <span className="text-sm font-bold text-white font-label">{step.num}</span>
                    </div>
                    {i < 2 && <div className="hidden md:block flex-1 h-0.5 bg-black" />}
                  </div>
                  <h3 className="text-xl font-semibold text-ink mb-2">{step.title}</h3>
                  <p className="text-sm text-ink-soft leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features - Multi-color cards: Indigo, Amber, Green, Dark */}
        <section className="border-b-2 border-ink bg-canvas-alt">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-20 md:py-28">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 border-2 border-ink bg-canvas text-xs font-label uppercase tracking-wider text-ink-soft shadow-[3px_3px_0_rgba(0,0,0,0.25)] mb-6">
                Features
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl text-ink leading-tight tracking-tight font-display">
                Tools that actually <span className="bg-[#7c3aed] text-white px-3 inline-block shadow-[3px_3px_0_rgba(0,0,0,0.25)]">work.</span>
              </h2>
              <p className="mt-4 text-ink-soft text-lg font-label">
                Every product needs a feature list. Here&apos;s ours. <s className="decoration-[#dc2626] decoration-2">You&apos;re welcome.</s>
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { bg: "#7c3aed", hover: "#6d28d9", title: "AI-Powered Analysis", desc: "JDs are dense. PRISM reads every line, surfaces the skills that actually matter, and tells you exactly what to highlight. No more scanning with your eyes half-closed." },
                { bg: "#0284c7", hover: "#0369a1", title: "Keyword Wizardry", desc: "ATS algorithms eat keywords for breakfast. PRISM extracts the technical terms buried in the job description so your resume doesn't get filtered out by a bot before a human sees it." },
                { bg: "#059669", hover: "#047857", title: "Score Everything", desc: "Numbers don't flatter. PRISM scores your resume against the JD and shows you exactly where it falls short. Low score? Fix it before you fire off another application." },
                { bg: "#111827", hover: "#1f2937", title: "Open Source, Baby", desc: "No paywall, no trial timer, no 'upgrade to pro'. The code is on GitHub, your data stays encrypted on Supabase, and the only thing we ask is a star if you find it useful." },
              ].map((card) => (
                <div key={card.title}
                  className="group border-2 border-ink p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] transition-all duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[9px_9px_0px_0px_rgba(0,0,0,0.25)] hover:rotate-[-1deg]"
                  style={{ backgroundColor: card.bg }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = card.hover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = card.bg}
                >
                  <h3 className="text-xl md:text-2xl mb-3 leading-tight text-white font-display">{card.title}</h3>
                  <p className="text-sm md:text-base text-white/85">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contribute */}
        <section className="border-b-2 border-ink">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-20 md:py-24 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border-2 border-ink bg-canvas-alt text-xs font-label uppercase tracking-wider text-ink-soft shadow-[3px_3px_0_rgba(0,0,0,0.25)] mb-8">
              <LogoIcon size={14} className="text-[#7c3aed]" />
              Open Source
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl text-ink leading-tight tracking-tight font-display mb-6">
              Built in the open.
              <br />
              <span className="bg-[#7c3aed] text-white px-3 inline-block shadow-[3px_3px_0_rgba(0,0,0,0.25)]">Yours to shape.</span>
            </h2>
            <p className="text-lg md:text-xl text-ink-soft max-w-xl mx-auto leading-relaxed mb-10">
              PRISM lives on GitHub. Every feature, every fix, every terrible decision — all public. Found a bug? Have an idea? Ship a PR.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <CTAButton href={GITHUB_URL}
                className="border-2 border-ink bg-canvas-alt text-ink hover:bg-canvas shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.25)] inline-flex items-center gap-2 px-6 py-3 text-base"
              >
                <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current" aria-hidden="true">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8" />
                </svg>
                View on GitHub
              </CTAButton>
              <CTAButton href={`${GITHUB_URL}/issues`}
                className="border-2 border-ink bg-[#0284c7] text-white hover:bg-[#0369a1] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.25)] inline-flex items-center gap-2 px-6 py-3 text-base"
              >
                Good First Issues <ArrowRight size={20} />
              </CTAButton>
            </div>
          </div>
        </section>

        {/* CTA - Peeking boxes behind black section */}
        <div className="relative max-w-5xl mx-auto">
          <FunkyShape className="absolute -top-8 -left-8 w-24 h-24 bg-[#0284c7] shadow-[4px_4px_0_rgba(0,0,0,0.25)] hidden lg:block z-0 rotate-[-12deg]" />
          <FunkyShape className="absolute -top-6 -right-6 w-20 h-20 bg-[#059669] shadow-[4px_4px_0_rgba(0,0,0,0.25)] hidden lg:block z-0 rotate-[8deg]" />
          <FunkyShape className="absolute -bottom-6 -left-6 w-20 h-20 bg-[#7c3aed] shadow-[4px_4px_0_rgba(0,0,0,0.25)] hidden lg:block z-0 rotate-[15deg]" />
          <FunkyShape className="absolute -bottom-8 -right-8 w-24 h-24 bg-[#0284c7] shadow-[4px_4px_0_rgba(0,0,0,0.25)] hidden lg:block z-0 rotate-[-10deg]" />
          <section className="bg-black text-white relative z-10">
            <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-20 md:py-28 text-center">
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl lg:text-6xl leading-tight tracking-tight mb-6 font-display">
                  <span className="bg-[#0284c7] text-ink px-4 inline-block shadow-[4px_4px_0_rgba(255,255,255,0.3)]">Stop</span> <s className="decoration-[#0284c7] decoration-2">guessing</s>. Tailor by hand.
                </h2>
                <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
                  PRISM is free, open source, and backed by Supabase. Your data is encrypted, your secrets are yours, and yes — you need an account. We promise the email/password tax is worth it.
                </p>
                <div className="flex flex-col items-center gap-4 sm:gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
                    <Link href="/login"
                      className="bg-canvas-alt text-ink border-2 border-white text-lg px-6 py-4 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-[8px_8px_0px_0px_#0284c7] hover:bg-[#0284c7] hover:text-ink hover:border-[#0284c7] inline-flex items-center justify-center gap-2 w-full transition-all duration-150 font-medium font-mono uppercase tracking-wide rounded-none"
                    >
                      Get Started Free <ArrowRight size={22} />
                    </Link>
                    <CTAButton href={GITHUB_URL}
                      className="bg-transparent text-white border-2 border-white text-lg px-6 py-4 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.4)] inline-flex items-center justify-center gap-2 w-full"
                    >
                      <svg viewBox="0 0 16 16" className="w-5 h-5 fill-current" aria-hidden="true">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8" />
                      </svg>
                      View on GitHub
                    </CTAButton>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-mono text-white/50">
                    <span className="w-16 h-px bg-white/20" />
                    <span className="bg-[#0284c7] text-ink px-3 py-0.5 text-xs font-bold uppercase tracking-wider">Vs</span>
                    <span className="w-16 h-px bg-white/20" />
                  </div>
                  <p className="text-sm md:text-base text-white/50 font-mono tracking-wide">
                    Still on the fence? Click nothing. The regret is free.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <div className="py-6 px-3 md:px-6">
        <footer className="relative max-w-6xl mx-auto bg-canvas-alt border-2 border-ink shadow-[8px_8px_0px_0px_rgba(0,0,0,0.25)] overflow-hidden">
          <div className="relative px-6 md:px-10 py-12">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-12">
              <div>
                <Link href="/" className="inline-flex items-center group">
                  <div className="bg-canvas-alt text-ink px-4 py-3 border-2 border-ink shadow-[4px_4px_0_rgba(0,0,0,0.25)] group-hover:shadow-[6px_6px_0_rgba(0,0,0,0.25)] transition-all flex items-center gap-2">
                    <LogoIcon size={22} />
                    <span className="text-lg md:text-xl uppercase font-label font-semibold tracking-[0.08em]">PRISM</span>
                  </div>
                </Link>
                <p className="text-ink-soft mt-4 max-w-md text-sm md:text-base">
                  Signup required. Data encrypted. No sneaky harvesting. Just a tool that does what it says.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { title: "Connect", links: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/shravan-kumar-deb-577b1037a" }, { label: "Instagram", href: "https://www.instagram.com/shravnnn.d" }] },
                ].map((group) => (
                  <div key={group.title}>
                    <h3 className="font-label text-xs uppercase tracking-widest text-ink mb-4">{group.title}</h3>
                    <ul className="space-y-3">
                      {group.links.map((link) => (
                        <li key={link.label}>
                          <a href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                            className="text-ink-soft hover:text-ink hover:underline transition-colors text-sm"
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t-2 border-ink pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-ink-soft text-sm">&copy; 2026 PRISM. No paywall, no nonsense, just auth.</p>
              <div className="flex items-center gap-4 text-sm text-ink-soft">
                <span>Ships on caffeine and open source stubbornness.</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
