import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getRegistrationsForUser } from "@/lib/queries/registrations";
import { getComplianceEventsForUser } from "@/lib/queries/complianceEvents";
import { buildAssistantSystemPrompt, streamAssistantReply } from "@/lib/assistant";

export const runtime = "nodejs";

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      })
    )
    .min(1)
    .max(40),
});

// AI formation assistant (build-order doc §Phase 5 step 1): grounded in the
// user's own registrations + compliance_events, streamed back as plain text
// chunks (not SSE — the chat panel reads the response body directly).
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const [registrations, complianceEvents] = await Promise.all([
    getRegistrationsForUser(user.id),
    getComplianceEventsForUser(user.id),
  ]);

  const systemPrompt = buildAssistantSystemPrompt(registrations, complianceEvents);
  const stream = await streamAssistantReply(systemPrompt, parsed.data.messages);

  return new NextResponse(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
