// Client-safe (no "server-only") — mirrors lib/state-filing/status.ts.
export const REGISTERED_AGENT_STATUSES = ["not_requested", "requested", "active", "canceled"] as const;
export type RegisteredAgentStatus = (typeof REGISTERED_AGENT_STATUSES)[number];

export interface RegisteredAgentOrder {
  id: string;
  registration_id: string;
  status: RegisteredAgentStatus;
  provider: string;
  provider_confirmation_id: string | null;
  requested_at: string | null;
  activated_at: string | null;
  updated_at: string;
  assigned_contractor_id: string | null;
}
