"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface CoverLetter {
  id: string;
  resumeId: string;
  content: string;
  language: string;
  createdAt: string;
}

export default function PrintCoverLetterPage() {
  const params = useParams();
  const id = params.id as string;
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/cover-letters?resumeId=${id}`);
        if (!res.ok) throw new Error("Failed to load cover letter");
        const data = await res.json();
        const letters = data.coverLetters;
        if (!letters || letters.length === 0) throw new Error("No cover letter found");
        setCoverLetter(letters[0]);
      } catch (e: any) {
        setError(e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!loading && coverLetter) {
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [loading, coverLetter]);

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black font-sans flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading cover letter...</p>
      </div>
    );
  }

  if (error || !coverLetter) {
    return (
      <div className="min-h-screen bg-white text-black font-sans flex items-center justify-center">
        <p className="text-sm text-gray-500">{error || "Cover letter not found"}</p>
      </div>
    );
  }

  return (
    <div className="print-container">
      <div className="print-content">
        <div className="print-header">
          <span className="print-watermark">PRISM</span>
        </div>

        <div className="letter-body">
          <p className="letter-date">{today}</p>

          <div className="recipient-placeholder my-6">
            <p className="text-sm text-gray-400 italic border-b border-dashed border-gray-300 pb-1">
              [Hiring Manager Name]
            </p>
            <p className="text-sm text-gray-400 italic">[Company Name]</p>
            <p className="text-sm text-gray-400 italic">[Company Address]</p>
          </div>

          <p className="salutation mb-4">Dear Hiring Manager,</p>

          <div className="letter-content whitespace-pre-wrap text-sm leading-relaxed">
            {coverLetter.content}
          </div>

          <p className="closing mt-8">Sincerely,</p>
          <p className="signature font-semibold mt-8">[Your Name]</p>
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 0.75in; }
          body { background: white !important; margin: 0; padding: 0; }
          .print-container { display: block !important; }
          .print-content { max-width: 100% !important; }
          .print-header { display: none; }
          .recipient-placeholder { display: none; }
          .letter-date { margin-top: 0; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        @media screen {
          body { background: #f0f0e8; margin: 0; padding: 24px; }
          .print-container {
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
          }
          .print-content {
            max-width: 700px;
            width: 100%;
            background: white;
            padding: 56px 64px;
            box-shadow: 0 2px 16px rgba(0,0,0,0.1);
            min-height: 11in;
          }
          .print-header {
            text-align: right;
            margin-bottom: 16px;
            font-size: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #999;
            font-family: var(--font-mono, monospace);
          }
          .letter-body { font-family: var(--font-sans, 'Source Sans 3', system-ui, sans-serif); }
          .letter-date { font-size: 14px; margin-bottom: 24px; }
          .salutation { font-size: 14px; }
          .letter-content { font-size: 13px; line-height: 1.7; }
          .closing { font-size: 14px; }
          .signature { font-size: 14px; }
        }
      `}</style>
    </div>
  );
}
