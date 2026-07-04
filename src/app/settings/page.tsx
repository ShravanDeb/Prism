"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle, AlertCircle, Loader2, Save, Cable, Database,
  FileText, Briefcase, TrendingUp, UserCheck, X
} from "lucide-react";
import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase-client";

type Provider = "openai" | "anthropic" | "gemini" | "deepseek" | "groq" | "ollama" | "openrouter" | "openai-compatible";
type Language = "en" | "es" | "fr" | "de" | "ja" | "zh";
type Effort = "auto" | "low" | "high";

const PROVIDERS: { value: Provider; label: string }[] = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "gemini", label: "Gemini" },
  { value: "deepseek", label: "DeepSeek" },
  { value: "groq", label: "Groq" },
  { value: "ollama", label: "Ollama" },
  { value: "openrouter", label: "OpenRouter" },
  { value: "openai-compatible", label: "OpenAI-compatible" },
];

const STANDARD_PROVIDERS: Provider[] = ["openai", "anthropic", "gemini"];
const LANGUAGES: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "zh", label: "Chinese" },
];
const EFFORTS: { value: Effort; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "low", label: "Low" },
  { value: "high", label: "High" },
];

interface HealthData {
  db: string;
  masterResume: string;
  resumeCount: number;
  jobCount: number;
  trackerCount: number;
  llmConfigured: boolean;
  llmProvider: string;
}

interface StatusCard {
  label: string;
  value: string | number;
  status: "ok" | "warn" | "error" | "info";
  icon: React.ReactNode;
  tooltip: string;
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative w-14 h-8 border-2 border-ink transition-all shadow-[2px_2px_0_rgba(0,0,0,0.25)] flex-shrink-0 ${
        enabled ? "bg-[#059669]" : "bg-canvas"
      }`}
    >
      <span
        className={`absolute top-[3px] left-[3px] w-[22px] h-[22px] border-2 border-ink bg-canvas transition-all ${
          enabled ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function ConfirmDialog({
  open, title, message, confirmLabel, onConfirm, onCancel, doubleConfirm, destructive
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  doubleConfirm?: boolean;
  destructive?: boolean;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => { if (!open) { setStep(0); } }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} className={`max-w-lg w-full bg-canvas-alt border-2 ${destructive ? "border-[#dc2626]" : "border-ink"} shadow-[12px_12px_0_rgba(0,0,0,0.25)] p-8`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display">{title}</h2>
          <button onClick={onCancel} className="p-1 border-2 border-ink bg-canvas hover:bg-[#dc2626] hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>
        <p className="text-sm text-ink-soft font-sans mb-6 leading-relaxed">{message}</p>
        {doubleConfirm && step === 0 ? (
          <div className="flex gap-2">
            <button onClick={() => setStep(1)}
              className={`flex-1 px-4 py-3 text-sm font-mono uppercase tracking-wider border-2 ${destructive ? "border-[#dc2626] bg-[#dc2626] text-white" : "border-ink bg-canvas text-ink"} shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all`}
            >
              I Understand, Continue
            </button>
            <button onClick={onCancel}
              className="px-4 py-3 text-sm font-mono border-2 border-ink bg-canvas text-ink-soft hover:text-ink transition-all"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={onConfirm}
              className={`flex-1 px-4 py-3 text-sm font-mono uppercase tracking-wider border-2 ${destructive ? "border-[#dc2626] bg-[#dc2626] text-white" : "border-ink bg-canvas text-ink"} shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all`}
            >
              {doubleConfirm ? "Yes, I'm Sure. Do It." : confirmLabel}
            </button>
            <button onClick={onCancel}
              className="px-4 py-3 text-sm font-mono border-2 border-ink bg-canvas text-ink-soft hover:text-ink transition-all"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [llmProvider, setLlmProvider] = useState<Provider>("openai");
  const [model, setModel] = useState("gpt-4o");
  const [apiKey, setApiKey] = useState("");
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState("");
  const [reasoningEffort, setReasoningEffort] = useState<Effort>("auto");

  const [coverLetterEnabled, setCoverLetterEnabled] = useState(true);
  const [outreachEnabled, setOutreachEnabled] = useState(true);
  const [coverLetterPrompt, setCoverLetterPrompt] = useState("");
  const [outreachPrompt, setOutreachPrompt] = useState("");

  const [uiLanguage, setUiLanguage] = useState<Language>("en");
  const [contentLanguage, setContentLanguage] = useState<Language>("en");

  const [testResult, setTestResult] = useState<{ success: boolean; response?: string; error?: string } | null>(null);
  const [testing, setTesting] = useState(false);

  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      await Promise.all([fetchSettings(), fetchHealth()]);
      setLoading(false);
    };
    init();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = await res.json();
      setLlmProvider(data.llmProvider || "openai");
      setModel(data.model || "gpt-4o");
      setApiBaseUrl(data.apiBaseUrl || "");
      setReasoningEffort(data.reasoningEffort || "auto");
      setUiLanguage(data.uiLanguage || "en");
      setContentLanguage(data.contentLanguage || "en");
      setCoverLetterEnabled(data.coverLetterEnabled ?? true);
      setOutreachEnabled(data.outreachEnabled ?? true);
      setApiKeySaved(!!data.apiKeyEncrypted);
      if (data.customPrompts) {
        const prompts = typeof data.customPrompts === "string" ? JSON.parse(data.customPrompts) : data.customPrompts;
        setCoverLetterPrompt(prompts.coverLetter || "");
        setOutreachPrompt(prompts.outreach || "");
      }
    } catch (e: any) {
      setError(e.message || "Failed to load settings. The settings server is being difficult.");
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch("/api/health");
      if (!res.ok) return;
      const data = await res.json();
      setHealth(data);
    } catch {
      // silence health fetch errors
    }
  };

  const saveSection = async (section: string, body: Record<string, any>) => {
    setSaving(section);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setApiKeySaved(!!data.apiKeyEncrypted);
    } catch (e: any) {
      setError(`[${section}] ${e.message || "Save failed. The computer said no."}`);
    } finally {
      setSaving(null);
    }
  };

  const handleSaveLlm = () => saveSection("llm", {
    llmProvider,
    model,
    ...(apiKey ? { apiKey } : {}),
    ...(apiBaseUrl ? { apiBaseUrl } : {}),
    reasoningEffort,
  });

  const handleSaveContent = () => saveSection("content", {
    coverLetterEnabled,
    outreachEnabled,
    customPrompts: { coverLetter: coverLetterPrompt, outreach: outreachPrompt },
  });

  const handleSaveLanguage = () => saveSection("language", {
    uiLanguage,
    contentLanguage,
  });

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test-connection" }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (e: any) {
      setTestResult({ success: false, error: e.message });
    } finally {
      setTesting(false);
    }
  };

  const handleClearKeys = async () => {
    setConfirmAction(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear-keys" }),
      });
      if (res.ok) {
        setApiKey("");
        setApiKeySaved(false);
      }
    } catch {
      setError("Failed to clear keys. They're stubborn.");
    }
  };

  const handleResetDb = async () => {
    setConfirmAction(null);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-db" }),
      });
    } catch {
      setError("Failed to reset database. It clings to existence.");
    }
  };

  const statusCards: StatusCard[] = health ? [
    {
      label: "LLM Health",
      value: health.llmConfigured ? "Connected" : "Not Configured",
      status: health.llmConfigured ? "ok" : "error",
      icon: <Cable size={20} />,
      tooltip: health.llmConfigured
        ? `Using ${health.llmProvider}. Your AI is ready to overthink things.`
        : "No API key configured. The AI is twiddling its thumbs.",
    },
    {
      label: "Database",
      value: health.db === "ok" ? "Operational" : "Error",
      status: health.db === "ok" ? "ok" : "error",
      icon: <Database size={20} />,
      tooltip: health.db === "ok"
        ? "Postgres is alive. Someone should give it a medal."
        : "Database is having an existential crisis.",
    },
    {
      label: "Resumes",
      value: health.resumeCount,
      status: health.resumeCount > 0 ? "ok" : "warn",
      icon: <FileText size={20} />,
      tooltip: `${health.resumeCount} resume${health.resumeCount === 1 ? "" : "s"} in the system. ${health.resumeCount > 0 ? "Looking good." : "Maybe upload one?"}`,
    },
    {
      label: "Jobs",
      value: health.jobCount,
      status: health.jobCount > 0 ? "ok" : "warn",
      icon: <Briefcase size={20} />,
      tooltip: `${health.jobCount} job description${health.jobCount === 1 ? "" : "s"} saved. ${health.jobCount > 0 ? "Ready for action." : "Go find some jobs."}`,
    },
    {
      label: "Improvements",
      value: health.trackerCount,
      status: health.trackerCount > 0 ? "ok" : "warn",
      icon: <TrendingUp size={20} />,
      tooltip: `${health.trackerCount} tracked improvement${health.trackerCount === 1 ? "" : "s"}. Progress is being made.`,
    },
    {
      label: "Master Resume",
      value: health.masterResume === "ready" ? "Ready" : "Missing",
      status: health.masterResume === "ready" ? "ok" : "error",
      icon: <UserCheck size={20} />,
      tooltip: health.masterResume === "ready"
        ? "Master resume is loaded and ready to be cloned."
        : "No master resume found. The foundation is missing.",
    },
  ] : [];

  const sectionBg = (index: number) => index % 2 === 0 ? "bg-canvas" : "bg-canvas-alt";

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas text-ink font-sans">
        <NavBar />
        <div className="pt-24 flex items-center justify-center">
          <div className="flex items-center gap-3 text-ink-soft font-mono text-sm">
            <Loader2 size={20} className="animate-spin" />
            Loading settings...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <NavBar />
      <main className="pt-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display leading-tight tracking-tight">
              Settings
            </h1>
            <p className="text-ink-soft font-mono text-sm mt-2">
              Tweak things. Break things. Fix things later.
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 border-2 border-[#dc2626] bg-[#dc2626]/5 flex items-start gap-3">
              <AlertCircle size={18} className="text-[#dc2626] flex-shrink-0 mt-0.5" />
              <p className="text-sm font-mono text-[#dc2626]">{error}</p>
            </div>
          )}

          {/* Section 1: System Status */}
          <section className={`${sectionBg(0)} py-20 md:py-28`}>
            <div className="max-w-4xl mx-auto px-4 md:px-6">
              <h2 className="text-2xl font-display mb-8">System Status</h2>
              <p className="text-sm text-ink-soft font-sans mb-8 max-w-2xl">
                A dashboard for your dashboard. Everything in one glance so you don't have to squint.
              </p>
              {health ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {statusCards.map((card) => (
                    <div
                      key={card.label}
                      title={card.tooltip}
                      className="border-2 border-ink bg-canvas-alt shadow-[4px_4px_0_rgba(0,0,0,0.25)] p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-ink-soft">{card.icon}</span>
                        <span
                          className={`w-3 h-3 rounded-none border border-ink ${
                            card.status === "ok" ? "bg-[#059669]" :
                            card.status === "warn" ? "bg-[#f97316]" :
                            "bg-[#dc2626]"
                          }`}
                        />
                      </div>
                      <p className="text-sm font-mono text-ink-soft mb-1 uppercase tracking-wider">{card.label}</p>
                      <p className="text-xl font-display">{card.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 text-ink-soft font-mono text-sm p-8 border-2 border-ink border-dashed">
                  <AlertCircle size={18} />
                  Could not fetch health data. The system is being mysterious.
                </div>
              )}
            </div>
          </section>

          {/* Section 2: LLM Configuration */}
          <section className={`${sectionBg(1)} py-20 md:py-28 border-b-2 border-ink`}>
            <div className="max-w-4xl mx-auto px-4 md:px-6">
              <h2 className="text-2xl font-display mb-8">LLM Configuration</h2>
              <p className="text-sm text-ink-soft font-sans mb-8 max-w-2xl">
                Tell the AI which brain to use. Choose wisely, or don't — we're not your manager.
              </p>
              <div className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-sm font-mono mb-2 uppercase tracking-wider">Provider</label>
                  <div className="relative">
                    <select
                      value={llmProvider}
                      onChange={(e) => setLlmProvider(e.target.value as Provider)}
                      className="w-full appearance-none px-4 py-3 text-sm font-mono border-2 border-ink bg-canvas text-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] focus:shadow-[4px_4px_0_rgba(0,0,0,0.25)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all outline-none"
                    >
                      {PROVIDERS.map((p) => (
                        <option key={p.value} value={p.value} className="bg-canvas text-ink">{p.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-ink-soft">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-mono mb-2 uppercase tracking-wider">Model Name</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="gpt-4o"
                    className="w-full px-4 py-3 text-sm font-mono border-2 border-ink bg-canvas text-ink placeholder:text-ink-soft/50 shadow-[3px_3px_0_rgba(0,0,0,0.25)] focus:shadow-[4px_4px_0_rgba(0,0,0,0.25)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono mb-2 uppercase tracking-wider">API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={apiKeySaved ? "••••••••" : "sk-..."}
                    className="w-full px-4 py-3 text-sm font-mono border-2 border-ink bg-canvas text-ink placeholder:text-ink-soft/50 shadow-[3px_3px_0_rgba(0,0,0,0.25)] focus:shadow-[4px_4px_0_rgba(0,0,0,0.25)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all outline-none"
                  />
                  <p className="text-xs text-ink-soft font-mono mt-1">{apiKeySaved ? "Key is saved. Type a new one to replace it." : "No key saved. The AI is unemployed."}</p>
                </div>

                {!STANDARD_PROVIDERS.includes(llmProvider) && (
                  <div>
                    <label className="block text-sm font-mono mb-2 uppercase tracking-wider">API Base URL</label>
                    <input
                      type="text"
                      value={apiBaseUrl}
                      onChange={(e) => setApiBaseUrl(e.target.value)}
                      placeholder={llmProvider === "ollama" ? "http://localhost:11434" : "https://api.example.com/v1"}
                      className="w-full px-4 py-3 text-sm font-mono border-2 border-ink bg-canvas text-ink placeholder:text-ink-soft/50 shadow-[3px_3px_0_rgba(0,0,0,0.25)] focus:shadow-[4px_4px_0_rgba(0,0,0,0.25)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-mono mb-2 uppercase tracking-wider">Reasoning Effort</label>
                  <div className="relative">
                    <select
                      value={reasoningEffort}
                      onChange={(e) => setReasoningEffort(e.target.value as Effort)}
                      className="w-full appearance-none px-4 py-3 text-sm font-mono border-2 border-ink bg-canvas text-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] focus:shadow-[4px_4px_0_rgba(0,0,0,0.25)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all outline-none"
                    >
                      {EFFORTS.map((e) => (
                        <option key={e.value} value={e.value} className="bg-canvas text-ink">{e.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-ink-soft">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveLlm}
                    disabled={saving === "llm"}
                    className="flex items-center gap-2 px-6 py-3 text-sm font-mono uppercase tracking-wider border-2 border-ink bg-canvas text-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all disabled:opacity-50"
                  >
                    {saving === "llm" ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save
                  </button>
                  <button
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="flex items-center gap-2 px-6 py-3 text-sm font-mono uppercase tracking-wider border-2 border-ink bg-canvas text-ink-soft hover:text-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all disabled:opacity-50"
                  >
                    {testing ? <Loader2 size={16} className="animate-spin" /> : <Cable size={16} />}
                    Test Connection
                  </button>
                </div>
              </div>

              {testResult && (
                <div className={`mt-6 max-w-xl p-4 border-2 ${
                  testResult.success ? "border-[#059669]" : "border-[#dc2626]"
                } bg-canvas shadow-[4px_4px_0_rgba(0,0,0,0.25)]`}>
                  <div className="flex items-start gap-3">
                    {testResult.success ? (
                      <CheckCircle size={18} className="text-[#059669] flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={18} className="text-[#dc2626] flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-sm font-mono font-bold uppercase tracking-wider ${
                        testResult.success ? "text-[#059669]" : "text-[#dc2626]"
                      }`}>
                        {testResult.success ? "Connection Successful" : "Connection Failed"}
                      </p>
                      <p className="text-sm text-ink-soft font-sans mt-1">
                        {testResult.success
                          ? `The AI responded: "${testResult.response}". It works. For now.`
                          : testResult.error || "Something went wrong. The AI is playing hard to get."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section 3: Content Generation */}
          <section className={`${sectionBg(2)} py-20 md:py-28 border-b-2 border-ink`}>
            <div className="max-w-4xl mx-auto px-4 md:px-6">
              <h2 className="text-2xl font-display mb-8">Content Generation</h2>
              <p className="text-sm text-ink-soft font-sans mb-8 max-w-2xl">
                Automate the boring parts. Let the robots write your cover letters.
              </p>
              <div className="space-y-10 max-w-xl">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-mono uppercase tracking-wider">Cover Letter Generation</label>
                    <Toggle enabled={coverLetterEnabled} onChange={setCoverLetterEnabled} />
                  </div>
                  <textarea
                    value={coverLetterPrompt}
                    onChange={(e) => setCoverLetterPrompt(e.target.value)}
                    placeholder="Write a custom prompt for cover letter generation. Be specific. The AI is literal-minded."
                    rows={4}
                    className="w-full px-4 py-3 text-sm font-sans border-2 border-ink bg-canvas text-ink placeholder:text-ink-soft/50 shadow-[3px_3px_0_rgba(0,0,0,0.25)] focus:shadow-[4px_4px_0_rgba(0,0,0,0.25)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all outline-none resize-y"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-mono uppercase tracking-wider">Outreach Message Generation</label>
                    <Toggle enabled={outreachEnabled} onChange={setOutreachEnabled} />
                  </div>
                  <textarea
                    value={outreachPrompt}
                    onChange={(e) => setOutreachPrompt(e.target.value)}
                    placeholder="Custom prompt for outreach messages. Sound human, not like a spam bot."
                    rows={4}
                    className="w-full px-4 py-3 text-sm font-sans border-2 border-ink bg-canvas text-ink placeholder:text-ink-soft/50 shadow-[3px_3px_0_rgba(0,0,0,0.25)] focus:shadow-[4px_4px_0_rgba(0,0,0,0.25)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all outline-none resize-y"
                  />
                </div>

                <button
                  onClick={handleSaveContent}
                  disabled={saving === "content"}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-mono uppercase tracking-wider border-2 border-ink bg-canvas text-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all disabled:opacity-50"
                >
                  {saving === "content" ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Content Settings
                </button>
              </div>
            </div>
          </section>

          {/* Section 4: Language Settings */}
          <section className={`${sectionBg(3)} py-20 md:py-28 border-b-2 border-ink`}>
            <div className="max-w-4xl mx-auto px-4 md:px-6">
              <h2 className="text-2xl font-display mb-8">Language Settings</h2>
              <p className="text-sm text-ink-soft font-sans mb-8 max-w-2xl">
                The UI speaks one language, the AI writes in another. They don't need to agree.
              </p>
              <div className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-sm font-mono mb-2 uppercase tracking-wider">UI Language</label>
                  <div className="relative">
                    <select
                      value={uiLanguage}
                      onChange={(e) => setUiLanguage(e.target.value as Language)}
                      className="w-full appearance-none px-4 py-3 text-sm font-mono border-2 border-ink bg-canvas text-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] focus:shadow-[4px_4px_0_rgba(0,0,0,0.25)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all outline-none"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.value} value={l.value} className="bg-canvas text-ink">{l.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-ink-soft">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-ink-soft font-mono mt-1">Changes the language of buttons and labels. Or it would, if we'd implemented translations. It's a promise.</p>
                </div>

                <div>
                  <label className="block text-sm font-mono mb-2 uppercase tracking-wider">Content Generation Language</label>
                  <div className="relative">
                    <select
                      value={contentLanguage}
                      onChange={(e) => setContentLanguage(e.target.value as Language)}
                      className="w-full appearance-none px-4 py-3 text-sm font-mono border-2 border-ink bg-canvas text-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] focus:shadow-[4px_4px_0_rgba(0,0,0,0.25)] focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all outline-none"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.value} value={l.value} className="bg-canvas text-ink">{l.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-ink-soft">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-ink-soft font-mono mt-1">The AI will write cover letters and outreach in this language. Results may vary.</p>
                </div>

                <button
                  onClick={handleSaveLanguage}
                  disabled={saving === "language"}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-mono uppercase tracking-wider border-2 border-ink bg-canvas text-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all disabled:opacity-50"
                >
                  {saving === "language" ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Language Settings
                </button>
              </div>
            </div>
          </section>

          {/* Section 5: Danger Zone */}
          <section className={`${sectionBg(4)} py-20 md:py-28`}>
            <div className="max-w-4xl mx-auto px-4 md:px-6">
              <h2 className="text-2xl font-display mb-8 text-[#dc2626]">Danger Zone</h2>
              <p className="text-sm text-ink-soft font-sans mb-8 max-w-2xl">
                Actions here are irreversible. We put a red border around this section so you know to be careful.
              </p>
              <div className="max-w-xl border-2 border-[#dc2626] p-8 shadow-[4px_4px_0_rgba(220,38,38,0.25)]">
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-mono font-bold uppercase tracking-wider">Clear All API Keys</p>
                      <p className="text-xs text-ink-soft font-mono mt-1">Removes stored API keys. The AI will stop working. That's the point.</p>
                    </div>
                    <button
                      onClick={() => setConfirmAction("clear-keys")}
                      className="flex-shrink-0 px-5 py-3 text-sm font-mono uppercase tracking-wider border-2 border-[#dc2626] bg-canvas text-[#dc2626] shadow-[3px_3px_0_rgba(220,38,38,0.25)] hover:shadow-[4px_4px_0_rgba(220,38,38,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
                    >
                      Clear Keys
                    </button>
                  </div>
                  <div className="border-t border-[#dc2626]/30" />
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-mono font-bold uppercase tracking-wider">Reset Entire Database</p>
                      <p className="text-xs text-ink-soft font-mono mt-1">Deletes all resumes, jobs, cards, and messages. Everything. Yes, everything.</p>
                    </div>
                    <button
                      onClick={() => setConfirmAction("reset-db")}
                      className="flex-shrink-0 px-5 py-3 text-sm font-mono uppercase tracking-wider border-2 border-[#dc2626] bg-[#dc2626] text-white shadow-[3px_3px_0_rgba(220,38,38,0.25)] hover:shadow-[4px_4px_0_rgba(220,38,38,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
                    >
                      Reset DB
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <ConfirmDialog
        open={confirmAction === "clear-keys"}
        title="Clear All API Keys"
        message="This will remove all stored API keys from the database. The AI will stop generating content until you add new keys. Are you sure?"
        confirmLabel="Yes, Clear Keys"
        onConfirm={handleClearKeys}
        onCancel={() => setConfirmAction(null)}
        destructive
      />

      <ConfirmDialog
        open={confirmAction === "reset-db"}
        title="Reset Entire Database"
        message="This action permanently deletes all your resumes, job descriptions, tracker cards, cover letters, and outreach messages. Your account will remain, but everything inside it will be gone. There is no undo. Make sure you've exported anything you want to keep."
        confirmLabel="Yes, Reset Everything"
        onConfirm={handleResetDb}
        onCancel={() => setConfirmAction(null)}
        doubleConfirm
        destructive
      />
    </div>
  );
}
