import "server-only";
import { query } from "@/lib/db";

// Expired sessions and consumed/expired magic-link tokens were never pruned
// anywhere — logout only ever deleted the current session row. Piggybacks on
// the daily compliance-reminders cron rather than getting its own scheduled
// function, since there's nothing time-sensitive about when this runs.
export async function cleanupExpiredSessionsAndTokens(): Promise<{
  sessionsDeleted: number;
  tokensCleared: number;
}> {
  const sessions = await query("DELETE FROM sessions WHERE expires_at < now()");
  const tokens = await query(
    `UPDATE users SET magic_link_token = NULL, token_expiry = NULL
     WHERE magic_link_token IS NOT NULL AND token_expiry < now()`
  );
  return {
    sessionsDeleted: sessions.rowCount ?? 0,
    tokensCleared: tokens.rowCount ?? 0,
  };
}
