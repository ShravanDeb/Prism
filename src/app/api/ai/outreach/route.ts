import { NextResponse } from "next/server";
import { complete, type LLMConfig } from "@/lib/llm-client";
import type { ResumeData } from "@/components/templates/resume-types";

const LLM_CONFIG: LLMConfig = {
  provider: "openai-compatible",
  model: "big-pickle",
  apiKey: "free",
  apiBaseUrl: "https://opencode.ai/zen/v1",
};

export async function POST(request: Request) {
  try {
    const { resumeData, jobDescription, type } = (await request.json()) as {
      resumeData: ResumeData;
      jobDescription?: string;
      type: "linkedin" | "email";
    };

    if (!resumeData) {
      return NextResponse.json({ error: "resumeData required" }, { status: 400 });
    }

    const resumeJson = JSON.stringify(resumeData, null, 2);

    const jobContext = jobDescription
      ? `\n\nThe message should reference this job description:\n${jobDescription}`
      : "";

    const styleGuide =
      type === "linkedin"
        ? "Write a LinkedIn connection request or InMail message. Keep it short and punchy (under 200 words). Be warm, professional, and mention a specific detail from their background. End with a soft ask or call to action."
        : "Write a professional outreach email. It should be concise but complete (under 250 words). Include a clear subject line suggestion at the top. Be professional, reference a specific detail, and end with a clear call to action.";

    const result = await complete(LLM_CONFIG, {
      messages: [
        {
          role: "system",
          content: `You are an expert professional outreach copywriter. Generate a ${type} outreach message based on the provided resume data.
${styleGuide}
Return ONLY the message content, no JSON wrapping or extra commentary.${jobContext}`,
        },
        {
          role: "user",
          content: `Generate a ${type} outreach message based on this resume:\n\n${resumeJson}`,
        },
      ],
      temperature: 0.7,
      maxTokens: 1024,
    });

    return NextResponse.json({ content: result });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
