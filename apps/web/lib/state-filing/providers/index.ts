import "server-only";
import type { FilingProvider } from "./types";
import { createFileFormsProvider } from "./fileforms";

// Returns null (no provider) when no vendor is configured for a state, in
// which case the existing manual worksheet (lib/state-filing/worksheet.ts) is
// the fallback — this is additive, not a replacement, until a provider's
// coverage/reliability is proven out.
export function getFilingProvider(state: string): FilingProvider | null {
  const apiKey = process.env.FILEFORMS_API_KEY;
  const webhookSecret = process.env.FILEFORMS_WEBHOOK_SECRET;
  if (apiKey && webhookSecret) {
    const provider = createFileFormsProvider(apiKey, webhookSecret);
    if (provider.supportsState(state)) return provider;
  }
  return null;
}

export function getFilingProviderByName(name: string): FilingProvider | null {
  const apiKey = process.env.FILEFORMS_API_KEY;
  const webhookSecret = process.env.FILEFORMS_WEBHOOK_SECRET;
  if (name === "fileforms" && apiKey && webhookSecret) {
    return createFileFormsProvider(apiKey, webhookSecret);
  }
  return null;
}

export type { FilingProvider, FormationSubmission, FilingWebhookEvent, FilingProviderResult } from "./types";
