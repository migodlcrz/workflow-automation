/**
 * AI Triage Service — powered by Groq (free tier)
 *
 * Completely decoupled from UI and database layers.
 * Receives raw ticket data, returns structured analysis.
 */

import Groq from "groq-sdk";
import type { AIAnalysisRaw, AIPriority } from "@/types/ticket";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

export interface TriageInput {
  subject: string;
  description: string;
  department: string;
  urgency_level: string;
  affected_system?: string | null;
}

const SYSTEM_PROMPT = `You are a senior IT support triage specialist. Your job is to analyze support tickets and produce structured metadata to help route and prioritize them efficiently.

You must respond with a single valid JSON object — no markdown, no prose, just JSON.

The JSON must strictly follow this schema:
{
  "category": string,         // One of: Hardware, Software, Network, Access & Permissions, Data & Reporting, Security, HR Systems, Finance Systems, General IT, Other
  "priority": string,         // One of: low, medium, high, critical
  "summary": string,          // 1-2 sentence plain-English summary of the issue
  "suggested_team": string,   // Team best suited to handle this: e.g. "IT Helpdesk", "Network Engineering", "Security Operations", "HR Systems", "Finance Systems", "DevOps", "Database Administration"
  "confidence_score": number, // Float between 0.0 and 1.0 — your confidence in this triage
  "tags": string[],           // 2-5 relevant lowercase tags, e.g. ["vpn", "access", "remote-work"]
  "estimated_resolution": string, // Human-readable estimate: e.g. "2-4 hours", "1-2 business days", "Same day"
  "root_cause": string,       // Likely root cause in 1 sentence
  "reasoning": string         // Brief explanation of why you chose this category and priority
}`;

function buildUserPrompt(input: TriageInput): string {
  return `Please triage the following support ticket:

**Department:** ${input.department}
**Urgency (user-reported):** ${input.urgency_level}
**Affected System:** ${input.affected_system ?? "Not specified"}
**Subject:** ${input.subject}

**Description:**
${input.description}`;
}

function validateAndCoerce(raw: unknown): AIAnalysisRaw {
  const obj = raw as Record<string, unknown>;

  const validCategories = [
    "Hardware", "Software", "Network", "Access & Permissions",
    "Data & Reporting", "Security", "HR Systems", "Finance Systems",
    "General IT", "Other",
  ];
  const validPriorities: AIPriority[] = ["low", "medium", "high", "critical"];

  return {
    category: validCategories.includes(obj.category as string)
      ? (obj.category as string)
      : "General IT",
    priority: validPriorities.includes(obj.priority as AIPriority)
      ? (obj.priority as AIPriority)
      : "medium",
    summary: typeof obj.summary === "string" ? obj.summary : "No summary available.",
    suggested_team: typeof obj.suggested_team === "string" ? obj.suggested_team : "IT Helpdesk",
    confidence_score:
      typeof obj.confidence_score === "number"
        ? Math.min(1, Math.max(0, obj.confidence_score))
        : 0.5,
    tags: Array.isArray(obj.tags)
      ? (obj.tags as unknown[]).filter((t) => typeof t === "string").slice(0, 5) as string[]
      : [],
    estimated_resolution:
      typeof obj.estimated_resolution === "string"
        ? obj.estimated_resolution
        : "1-2 business days",
    root_cause: typeof obj.root_cause === "string" ? obj.root_cause : "Unknown",
    reasoning: typeof obj.reasoning === "string" ? obj.reasoning : "",
  };
}

export async function triageTicket(input: TriageInput): Promise<AIAnalysisRaw> {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    max_tokens: 800,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(input) },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "";

  // Extract JSON — handle models that wrap in markdown code blocks
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`AI response did not contain valid JSON. Raw: ${content.slice(0, 200)}`);
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return validateAndCoerce(parsed);
}
