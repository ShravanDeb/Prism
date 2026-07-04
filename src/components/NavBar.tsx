"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, Settings, Columns3, LogOut, Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { LogoIcon } from "@/components/LogoIcon";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Resumes", href: "/resumes", icon: FileText },
  { label: "Tracker", href: "/tracker", icon: Columns3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = () => {
    router.push("/");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 border-b-2 border-ink bg-canvas-alt shadow-[0_4px_0_0_rgba(0,0,0,0.25)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-canvas-alt text-ink px-3 py-2 border-2 border-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] group-hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] transition-all flex items-center gap-2">
                <LogoIcon size={20} />
                <span className="text-sm uppercase font-label font-semibold tracking-[0.08em] hidden md:block">PRISM</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-mono transition-all border-2 ${
                      active
                        ? "border-ink bg-canvas text-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)]"
                        : "border-transparent text-ink-soft hover:text-ink hover:border-ink"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggle} className="p-2 border-2 border-ink bg-canvas hover:bg-canvas-alt transition-all shadow-[2px_2px_0_rgba(0,0,0,0.25)] hover:shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px]">
                {theme === "dark" ? <Sun size={16} className="text-[#0284c7]" /> : <Moon size={16} className="text-[#7c3aed]" />}
              </button>
              <button onClick={handleSignOut} className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-mono border-2 border-ink bg-canvas text-ink-soft hover:text-ink transition-all shadow-[2px_2px_0_rgba(0,0,0,0.25)] hover:shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px]">
                <LogOut size={16} />
                Sign Out
              </button>
              <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 border-2 border-ink bg-canvas shadow-[2px_2px_0_rgba(0,0,0,0.25)]">
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/40" role="dialog" aria-modal="true" onClick={() => setMobileOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="fixed inset-x-3 top-3 bg-canvas-alt border-2 border-ink shadow-[8px_8px_0px_0px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-ink">
              <span className="text-sm font-mono font-bold uppercase tracking-wider">Navigation</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 border-2 border-ink bg-canvas hover:bg-[#dc2626] transition">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-mono border-2 transition-all ${
                      active ? "border-ink bg-canvas text-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)]" : "border-transparent text-ink-soft"
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
              <button onClick={() => { handleSignOut(); setMobileOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 text-sm font-mono border-2 border-ink bg-canvas text-ink-soft hover:text-ink w-full mt-4 transition-all shadow-[3px_3px_0_rgba(0,0,0,0.25)]"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
