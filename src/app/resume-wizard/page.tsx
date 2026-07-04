"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";

const STEPS = [
  { id: 1, question: "What's your full name and email address?" },
  {
    id: 2,
    question:
      "What's your professional title or summary? (e.g. 'Senior Frontend Engineer with 5 years of experience')",
  },
  {
    id: 3,
    question:
      "Tell me about your work experience. Start with your most recent role — company, title, dates.",
  },
  {
    id: 4,
    question: "What's your educational background? (School, degree, graduation year)",
  },
  {
    id: 5,
    question: "What are your key skills? (Comma-separated list)",
  },
  {
    id: 6,
    question: "Any projects you want to highlight? (Optional — skip if not applicable)",
  },
];

const INITIAL_ANSWERS: Record<string, string> = Object.fromEntries(
  STEPS.map((s) => [String(s.id), ""])
);

export default function ResumeWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>(INITIAL_ANSWERS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const currentAnswer = answers[String(currentStep)] ?? "";
  const totalSteps = STEPS.length;
  const progress = (currentStep / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps;

  const handleAnswerChange = useCallback(
    (value: string) => {
      setAnswers((prev) => ({ ...prev, [String(currentStep)]: value }));
    },
    [currentStep]
  );

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps) setCurrentStep((prev) => prev + 1);
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    if (currentStep < totalSteps) setCurrentStep((prev) => prev + 1);
  }, [currentStep]);

  const handleFinalize = useCallback(async () => {
    setSubmitting(true);
    setError("");
    try {
      const raw = answers["1"]?.trim() || "";
      const name = raw.includes(",") ? raw.split(",")[0].trim() : raw || "Untitled";
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "master", title: name, answers }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save resume");
      }
      router.push("/dashboard");
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Try again.");
      setSubmitting(false);
    }
  }, [answers, router]);

  const buildPreview = useCallback(() => {
    const parts: string[] = [];
    const a1 = answers["1"]?.trim();
    const a2 = answers["2"]?.trim();
    const a3 = answers["3"]?.trim();
    const a4 = answers["4"]?.trim();
    const a5 = answers["5"]?.trim();
    const a6 = answers["6"]?.trim();

    if (a1) parts.push(a1);
    if (a2) parts.push("", a2);
    if (a3) parts.push("", "Experience:", a3);
    if (a4) parts.push("", "Education:", a4);
    if (a5) parts.push("", "Skills:", a5);
    if (a6) parts.push("", "Projects:", a6);

    return parts.length > 0 ? parts.join("\n") : "Your resume preview will appear here...";
  }, [answers]);

  return (
    <div className="min-h-screen bg-canvas pt-16">
      <NavBar />

      <main className="mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col border-r-2 border-ink p-8">
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between font-mono text-sm text-ink-soft">
              <span>
                Step {currentStep} of {totalSteps}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-3 border-2 border-ink bg-canvas-alt">
              <div
                className="h-full bg-ink transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold text-ink mb-6">
            {STEPS[currentStep - 1].question}
          </h1>

          <textarea
            className="w-full min-h-[120px] border-2 border-ink bg-canvas-alt p-4 font-mono text-sm text-ink placeholder:text-ink-soft resize-none mb-6"
            placeholder="Type your answer here..."
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
          />

          <div className="mt-auto flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="border-2 border-ink px-6 py-2 font-mono text-sm text-ink-soft transition-colors hover:bg-ink hover:text-canvas disabled:opacity-30 disabled:pointer-events-none"
            >
              Back
            </button>

            <div className="flex items-center gap-4">
              {error && (
                <span className="text-xs font-mono text-[#dc2626]">{error}</span>
              )}
              {currentStep < totalSteps && (
                <button
                  onClick={handleSkip}
                  className="border-2 border-ink px-6 py-2 font-mono text-sm text-ink-soft transition-colors hover:bg-ink hover:text-canvas"
                >
                  Skip
                </button>
              )}

              {isLastStep ? (
                <button
                  onClick={handleFinalize}
                  disabled={submitting}
                  className="border-2 border-ink bg-ink px-8 py-2 font-mono text-sm text-canvas transition-colors hover:bg-canvas hover:text-ink disabled:opacity-30"
                >
                  {submitting ? "Saving..." : "Finalize"}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="border-2 border-ink bg-ink px-8 py-2 font-mono text-sm text-canvas transition-colors hover:bg-canvas hover:text-ink"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col p-8">
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-ink-soft mb-4">
            Resume Preview
          </h2>
          <div className="flex-1 border-2 border-ink bg-canvas-alt p-6">
            <pre className="font-mono text-sm text-ink whitespace-pre-wrap">
              {buildPreview()}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
