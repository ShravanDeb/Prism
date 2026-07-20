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
    const { resumeData, jobDescription } = (await request.json()) as {
      resumeData: ResumeData;
      jobDescription?: string;
    };

    if (!resumeData) {
      return NextResponse.json({ error: "resumeData required" }, { status: 400 });
    }

    const resumeJson = JSON.stringify(resumeData, null, 2);

    const jobContext = jobDescription
      ? `\n\nThe cover letter should be tailored to this job description:\n${jobDescription}`
      : "";

    const result = await complete(LLM_CONFIG, {
      messages: [
        {
          role: "system",
          content: `You are a professional cover letter writer. Generate a compelling, professional cover letter based on the provided resume data.
The letter should:
- Have a strong opening that grabs attention
- Highlight relevant experience and skills from the resume
- Show enthusiasm for the role
- Be concise (3-4 paragraphs)
- Use a professional but personable tone
- End with a clear call to action
Return ONLY the cover letter text, no JSON wrapping or extra commentary.${jobContext}`,
        },
        {
          role: "user",
          content: `Generate a cover letter based on this resume:\n\n${resumeJson}`,
        },
      ],
      temperature: 0.7,
      maxTokens: 2048,
    });

    return NextResponse.json({ content: result });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
