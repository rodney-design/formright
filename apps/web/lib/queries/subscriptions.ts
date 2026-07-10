import "server-only";
import { query } from "@/lib/db";

export interface Subscription {
  id: string;
  plan: "comply" | "agent";
  status: string;
  renews_at: string | null;
  created_at: string;
}

export async function getSubscriptionsForUser(userId: string): Promise<Subscription[]> {
  const result = await query<Subscription>(
    "SELECT id, plan, status, renews_at, created_at FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return result.rows;
}
