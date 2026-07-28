import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getRegistrationsForUser } from "@/lib/queries/registrations";
import { getComplianceEventsForUser } from "@/lib/queries/complianceEvents";
import { buildAssistantSystemPrompt, streamAssistantReply } from "@/lib/assistant";
import { checkRateLimit, RateLimitError } from "@/lib/rateLimit";

export const runtime = "nodejs";

// BUG (fixed): content had no .max(), and the 40-message cap only bounds
// *count*, not *size* — a single authenticated user could send 40 messages
// of several MB each in one request, all forwarded verbatim to the
// (expensive) Anthropic model, with no rate limiting on top of that either.
// 4000 chars is generous for a chat-style message while bounding worst-case
// cost per request to something sane.
const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
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

  // BUG (fixed): this route had no rate limiting at all, unlike the v1 API
  // key routes (lib/apiAuth.ts). Keyed by user id, same choke point / same
  // in-memory limiter as everywhere else in the app.
  try {
    checkRateLimit(`assistant:${user.id}`);
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(err.retryAfterSeconds) } }
      );
    }
    throw err;
  }

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
