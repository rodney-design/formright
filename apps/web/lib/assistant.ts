import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Registration } from "@/lib/queries/registrations";
import type { ComplianceEventRow } from "@/lib/queries/complianceEvents";
import { entityFamily } from "@/lib/entities/entityFamily";

let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  _client = new Anthropic({ apiKey });
  return _client;
}

export const ASSISTANT_MODEL = "claude-opus-4-8";

const NON_ATTORNEY_DISCLAIMER =
  "FormRight is not a law firm and does not provide legal advice. No attorney-client " +
  "relationship is created by this conversation. For anything with real legal or tax " +
  "consequences, the user should consult a licensed attorney or accountant.";

// AI formation assistant (build-order doc §Phase 5 step 2): system prompt
// scoped to entity-type and state-specific formation/compliance Q&A,
// grounded in the user's own data — not general legal advice. Mirrors the
// non-attorney disclaimer already present sitewide (components/marketing/DisclaimerBar.tsx).
export function buildAssistantSystemPrompt(
  registrations: Registration[],
  complianceEvents: ComplianceEventRow[]
): string {
  const regSummaries = registrations.length
    ? registrations
        .map((r) => {
          const family = entityFamily(r.entity_type);
          return `- ${r.orgname} (${r.id}): ${family} in ${r.state}, status "${r.status}", plan "${r.plan}"`;
        })
        .join("\n")
    : "(no formations on file yet)";

  const eventsByRegistration = new Map(registrations.map((r) => [r.id, r.orgname]));
  const pendingEvents = complianceEvents.filter((e) => e.status === "pending");
  const eventSummaries = pendingEvents.length
    ? pendingEvents
        .map((e) => {
          const orgname = eventsByRegistration.get(e.registration_id) ?? e.registration_id;
          return `- ${orgname}: ${e.event_type} due ${new Date(e.due_date).toLocaleDateString()}`;
        })
        .join("\n")
    : "(no pending compliance deadlines)";

  return `You are the FormRight formation assistant, embedded in a client's dashboard.

Scope: answer questions about business entity formation and ongoing compliance —
entity-type differences (LLC/C-Corp/S-Corp/Nonprofit/Benefit Corp/PC/Sole
Proprietorship), state filing requirements, the documents FormRight generates,
and the compliance deadlines below. Ground every answer in the user's own data
when it's relevant; don't invent facts about their specific filings.

Out of scope: general legal advice, tax advice beyond publicly-known filing
requirements, guidance unrelated to business formation/compliance, and anything
requiring a license FormRight doesn't hold. When a question crosses into legal
or tax advice territory, say so plainly and recommend a licensed attorney or
accountant instead of guessing.

${NON_ATTORNEY_DISCLAIMER} Include a short version of this reminder whenever
you discuss anything with real legal or financial consequences — you don't
need to repeat it on every single message, but never let a substantive answer
stand without it being clear this isn't legal advice.

The user's formations on file:
${regSummaries}

Their pending compliance deadlines:
${eventSummaries}

Be concise. This is a chat panel, not a report — short paragraphs, no walls of text.`;
}

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

export async function streamAssistantReply(
  systemPrompt: string,
  messages: AssistantMessage[]
): Promise<ReadableStream<Uint8Array>> {
  const client = getAnthropicClient();
  const encoder = new TextEncoder();

  const anthropicStream = client.messages.stream({
    model: ASSISTANT_MODEL,
    max_tokens: 2048,
    system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
    messages,
  });

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      anthropicStream.on("text", (delta) => {
        controller.enqueue(encoder.encode(delta));
      });
      anthropicStream.on("end", () => {
        controller.close();
      });
      anthropicStream.on("error", (err) => {
        controller.error(err);
      });
    },
    cancel() {
      anthropicStream.abort();
    },
  });
}
