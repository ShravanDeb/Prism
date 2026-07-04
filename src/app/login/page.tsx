"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LogoIcon } from "@/components/LogoIcon";
import { createClient } from "@/lib/supabase-client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [comingSoon, setComingSoon] = useState("");

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (signUpError) throw signUpError;
        setError("Check your email for a verification link. We'll wait.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("Invalid login credentials")) {
        setError("That password's wrong. Try again, or don't — up to you.");
      } else if (msg.includes("Email not confirmed")) {
        setError("Haven't seen you before. Check your inbox for the verification link.");
      } else if (msg.includes("already registered")) {
        setError("That email's already taken. Try signing in instead.");
      } else {
        setError(msg || "Something went sideways. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github" | "linkedin_oidc") => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}` },
    });
  };

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-mono text-ink-soft hover:text-ink mb-8 transition-colors">
          <ArrowLeft size={16} />
          Back home
        </Link>

        <div className="border-2 border-ink bg-canvas-alt shadow-[8px_8px_0px_0px_rgba(0,0,0,0.25)] p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-canvas text-ink px-4 py-3 border-2 border-ink shadow-[4px_4px_0_rgba(0,0,0,0.25)] flex items-center gap-2">
              <LogoIcon size={24} />
              <span className="text-lg uppercase font-label font-semibold tracking-[0.08em]">PRISM</span>
            </div>
          </div>

          <div className="flex mb-8 border-2 border-ink">
            <button onClick={() => { setMode("signin"); setError(""); }}
              className={`flex-1 py-3 text-sm font-mono uppercase tracking-wider transition-all ${
                mode === "signin" ? "bg-[#7c3aed] text-white shadow-[2px_2px_0_rgba(0,0,0,0.25)]" : "bg-canvas text-ink-soft hover:text-ink"
              }`}
            >Sign In</button>
            <button onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 py-3 text-sm font-mono uppercase tracking-wider transition-all ${
                mode === "signup" ? "bg-[#7c3aed] text-white shadow-[2px_2px_0_rgba(0,0,0,0.25)]" : "bg-canvas text-ink-soft hover:text-ink"
              }`}
            >Sign Up</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-ink-soft mb-1">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-canvas border-2 border-ink text-ink text-sm font-sans focus:shadow-[3px_3px_0_rgba(0,0,0,0.25)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all outline-none placeholder:text-ink-soft"
                  placeholder="Ada Lovelace" />
              </div>
            )}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-soft mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-3 bg-canvas border-2 border-ink text-ink text-sm font-sans focus:shadow-[3px_3px_0_rgba(0,0,0,0.25)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all outline-none placeholder:text-ink-soft"
                placeholder="ada@example.com" />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-soft mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="w-full px-4 py-3 bg-canvas border-2 border-ink text-ink text-sm font-sans focus:shadow-[3px_3px_0_rgba(0,0,0,0.25)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all outline-none placeholder:text-ink-soft"
                placeholder="••••••••" />
            </div>

            {error && (
              <div className="px-4 py-3 border-2 border-[#dc2626] bg-[#dc2626]/10 text-sm text-[#dc2626] font-mono">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 text-sm font-mono uppercase tracking-wider border-2 border-ink bg-[#7c3aed] text-white shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:shadow-[5px_5px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] disabled:opacity-50 disabled:hover:translate-x-0 transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                  {mode === "signin" ? "Signing in..." : "Creating account..."}
                </span>
              ) : (mode === "signin" ? "Sign In" : "Create Account")}
            </button>
          </form>

          {comingSoon && (
            <div className="px-4 py-3 border-2 border-[#7c3aed] bg-[#7c3aed]/10 text-sm text-[#7c3aed] font-mono mb-4 text-center">
              {comingSoon} login is taking a nap. It'll be back before your next coffee break.
            </div>
          )}

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-ink/20" />
            <span className="text-xs font-mono text-ink-soft uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-ink/20" />
          </div>

          <div className="space-y-3">
            <button onClick={() => handleOAuth("github")} disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 text-sm font-mono border-2 border-ink bg-canvas text-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all disabled:opacity-50"
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg>
              Continue with GitHub
            </button>
            <button onClick={() => setComingSoon("Google")} disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 text-sm font-mono border-2 border-ink bg-canvas text-ink/40 shadow-[3px_3px_0_rgba(0,0,0,0.25)] cursor-not-allowed transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-40" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <button onClick={() => setComingSoon("LinkedIn")} disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 text-sm font-mono border-2 border-ink bg-canvas text-ink/40 shadow-[3px_3px_0_rgba(0,0,0,0.25)] cursor-not-allowed transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#0a66c2] opacity-40" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Continue with LinkedIn
            </button>
          </div>

          {mode === "signin" && (
            <div className="mt-4 text-center">
              <button className="text-xs font-mono text-ink-soft hover:text-ink underline transition-colors">
                Forgot password?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
