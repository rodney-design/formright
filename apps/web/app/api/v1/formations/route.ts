import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { requireApiKeyFirm, ApiAuthError, RateLimitError } from "@/lib/apiAuth";
import { entityFamily } from "@/lib/entities/entityFamily";
import { getStateFeeForEntity } from "@/lib/entities/stateFeesTable";
import { withRegistrationIdRetry } from "@/lib/registrationId";
import { seedComplianceEventsForRegistration } from "@/lib/entities/complianceRulesTable";
import { ensureStateFiling } from "@/lib/queries/stateFilings";
import { getRegistrationsForFirm } from "@/lib/queries/registrations";

export const runtime = "nodejs";

const boardMemberSchema = z.object({
  name: z.string(),
  role: z.string(),
  email: z.string().optional().default(""),
});

// REST API v1 (build-order doc §Phase 4 step 3), scoped to the calling
// firm's own clients only. Unlike /api/checkout (the individual consumer
// flow), formations created here don't run a per-formation Stripe
// checkout — Pro-tier firms are billed per-seat (see
// /api/subscriptions/pro/checkout), so a formation is marked 'paid'
// immediately on creation. The client still owns their own `users` row
// (find-or-create by email, same as /api/checkout) — the firm manages the
// formation, but doesn't own the underlying client account.
const formationSchema = z.object({
  orgname: z.string().min(1),
  orgtype: z.string().min(1),
  state: z.string().min(1),
  fiscal: z.string().optional().default(""),
  address: z.string().min(1),
  city: z.string().min(1),
  zip: z.string().optional().default(""),
  ein: z.string().optional().default(""),
  mission: z.string().optional().default(""),
  board: z.array(boardMemberSchema).default([]),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
});

export async function POST(req: NextRequest) {
  let firmId: string;
  try {
    firmId = await requireApiKeyFirm(req);
  } catch (err) {
    if (err instanceof ApiAuthError) return NextResponse.json({ error: err.message }, { status: 401 });
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429, headers: { "Retry-After": String(err.retryAfterSeconds) } }
      );
    }
    throw err;
  }

  const body = await req.json().catch(() => null);
  const parsed = formationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const family = entityFamily(data.orgtype);

  const stateFeeDetail = await getStateFeeForEntity(data.state, family);
  const stateFeeCents = stateFeeDetail?.feeCents ?? 0;

  // BUG (fixed): this used to SELECT-then-branch to INSERT, with no
  // transaction/locking. users.email is UNIQUE NOT NULL — two concurrent
  // requests for the same new client email (a firm's integration retrying,
  // or two near-simultaneous formations for a new client) both saw "not
  // found" and both attempted INSERT; the loser threw an uncaught
  // unique-violation with nothing here to catch it. INSERT ... ON CONFLICT
  // DO UPDATE (a no-op update, just to make RETURNING work on the conflict
  // path too) finds-or-creates the user in one atomic statement.
  const upserted = await query<{ id: string }>(
    `INSERT INTO users (email, name) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET email = users.email
     RETURNING id`,
    [data.contactEmail, data.contactName]
  );
  const userId = upserted.rows[0].id;

  const notes = JSON.stringify({ orgtypeRaw: data.orgtype, source: "api_v1" });

  // BUG (fixed): generateRegistrationId()'s 6-digit id had no DB-side
  // uniqueness check before this insert — see lib/registrationId.ts for the
  // collision odds. withRegistrationIdRetry generates a fresh id and
  // retries just this insert on a genuine collision.
  const registrationId = await withRegistrationIdRetry(async (id) => {
    await query(
      `INSERT INTO registrations
         (id, user_id, firm_id, orgname, entity_type, state, plan, status, amount_cents, state_fee_cents,
          board, mission, contact_name, contact_email, address, ein, fiscal_year, notes)
       VALUES ($1,$2,$3,$4,$5,$6,'Pro (API)','paid',$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [
        id,
        userId,
        firmId,
        data.orgname,
        family,
        data.state,
        stateFeeCents,
        stateFeeCents,
        JSON.stringify(data.board),
        data.mission,
        data.contactName,
        data.contactEmail,
        JSON.stringify({ address: data.address, city: data.city, zip: data.zip }),
        data.ein,
        data.fiscal,
        notes,
      ]
    );
    return id;
  });

  for (const event of await seedComplianceEventsForRegistration(family, data.state, new Date(), data.fiscal)) {
    await query(
      "INSERT INTO compliance_events (registration_id, event_type, due_date) VALUES ($1, $2, $3)",
      [registrationId, event.eventType, event.dueDate]
    );
  }
  await ensureStateFiling(registrationId, data.state);

  return NextResponse.json({ registrationId }, { status: 201 });
}

export async function GET(req: NextRequest) {
  let firmId: string;
  try {
    firmId = await requireApiKeyFirm(req);
  } catch (err) {
    if (err instanceof ApiAuthError) return NextResponse.json({ error: err.message }, { status: 401 });
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429, headers: { "Retry-After": String(err.retryAfterSeconds) } }
      );
    }
    throw err;
  }

  const registrations = await getRegistrationsForFirm(firmId);
  return NextResponse.json({ formations: registrations });
}
