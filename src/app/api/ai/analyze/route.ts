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
    const { resumeData } = (await request.json()) as { resumeData: ResumeData };

    if (!resumeData) {
      return NextResponse.json({ error: "resumeData required" }, { status: 400 });
    }

    const resumeJson = JSON.stringify(resumeData, null, 2);

    const result = await complete(LLM_CONFIG, {
      messages: [
        {
          role: "system",
          content: `You are an expert resume analyst. Analyze the provided resume JSON and suggest improvements.
Return ONLY a valid JSON object with no extra text, in this exact format:
{
  "suggestions": [
    {
      "sectionType": "string - the type of section (e.g. experience, education, skills)",
      "entryId": "string - the ID of the specific entry to improve",
      "field": "string - the field to improve (e.g. title, description, bullets)",
      "original": "string - the current value",
      "suggested": "string - the improved value",
      "reason": "string - explanation of why this change is recommended"
    }
  ]
}
Focus on: clarity, impact, quantification, action verbs, and relevance. If the resume is already strong, return an empty suggestions array.`,
        },
        {
          role: "user",
          content: `Analyze this resume and suggest improvements:\n\n${resumeJson}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 4096,
    });

    const parsed = JSON.parse(result);
    return NextResponse.json({ suggestions: parsed.suggestions ?? [] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
