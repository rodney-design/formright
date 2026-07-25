import type { FilingStatus } from "../status";

export interface FormationSubmission {
  registrationId: string;
  state: string;
  entityType: string;
  entityName: string;
  address: { line1: string; city: string; zip: string };
  registeredAgentName?: string;
  registeredAgentAddress?: string;
  organizerName?: string;
  contactEmail?: string;
}

export interface FilingProviderResult {
  providerFilingId: string;
}

export interface FilingWebhookEvent {
  providerFilingId: string;
  status: FilingStatus;
  stateConfirmationId?: string;
  stampedDocUrl?: string;
}

// A pluggable client for a third-party filer (doola, FileForms, CT Corp, ...)
// that submits formations to states on FormRight's behalf and reports status
// back over webhooks. This does NOT talk to a state government API directly —
// as of the Phase 3 research (README.md "Phase 3 — State Filing
// Integrations"), no priority state exposes one. It talks to a vendor who
// already operates as an approved filer and exposes that as a REST API.
export interface FilingProvider {
  readonly name: string;
  supportsState(state: string): boolean;
  submitFormation(input: FormationSubmission): Promise<FilingProviderResult>;
  verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean;
  parseWebhookEvent(rawBody: string): FilingWebhookEvent | null;
}
