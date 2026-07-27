import "server-only";
import { query } from "@/lib/db";
import type { RegisteredAgentOrder, RegisteredAgentStatus } from "@/lib/registered-agent/status";
export type { RegisteredAgentOrder, RegisteredAgentStatus } from "@/lib/registered-agent/status";

export async function getRegisteredAgentOrderById(id: string): Promise<RegisteredAgentOrder | null> {
  const result = await query<RegisteredAgentOrder>("SELECT * FROM registered_agent_orders WHERE id = $1", [id]);
  return result.rows[0] ?? null;
}

export async function getRegisteredAgentOrderForRegistration(
  registrationId: string
): Promise<RegisteredAgentOrder | null> {
  const result = await query<RegisteredAgentOrder>(
    "SELECT * FROM registered_agent_orders WHERE registration_id = $1 ORDER BY updated_at DESC LIMIT 1",
    [registrationId]
  );
  return result.rows[0] ?? null;
}

// Called when a registration that purchased the registered_agent addon has
// its payment confirmed (mirrors ensureStateFiling in lib/queries/stateFilings.ts).
export async function ensureRegisteredAgentOrder(registrationId: string): Promise<RegisteredAgentOrder> {
  const existing = await getRegisteredAgentOrderForRegistration(registrationId);
  if (existing) return existing;
  const result = await query<RegisteredAgentOrder>(
    "INSERT INTO registered_agent_orders (registration_id) VALUES ($1) RETURNING *",
    [registrationId]
  );
  return result.rows[0];
}

export interface RegisteredAgentOrderUpdate {
  status?: RegisteredAgentStatus;
  providerConfirmationId?: string;
}

export async function updateRegisteredAgentOrder(
  id: string,
  update: RegisteredAgentOrderUpdate
): Promise<RegisteredAgentOrder | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (update.status !== undefined) {
    sets.push(`status = $${i++}`);
    values.push(update.status);
    if (update.status === "requested") {
      sets.push(`requested_at = COALESCE(requested_at, now())`);
    }
    if (update.status === "active") {
      sets.push(`activated_at = COALESCE(activated_at, now())`);
    }
  }
  if (update.providerConfirmationId !== undefined) {
    sets.push(`provider_confirmation_id = $${i++}`);
    values.push(update.providerConfirmationId);
  }
  if (sets.length === 0) return null;

  sets.push(`updated_at = now()`);
  values.push(id);

  const result = await query<RegisteredAgentOrder>(
    `UPDATE registered_agent_orders SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
    values
  );
  return result.rows[0] ?? null;
}
