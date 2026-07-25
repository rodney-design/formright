import { createHmac, timingSafeEqual } from "crypto";
import type { FilingProvider, FilingWebhookEvent, FormationSubmission } from "./types";
import type { FilingStatus } from "../status";

// FileForms markets a "Business Formation API" (POST-and-webhook shape,
// HMAC-signed callbacks, all-50-states formation/registered-agent/annual-report
// coverage) aimed at platforms and partners. This client is written from their
// public marketing/docs pages only — direct fetches to docs.fileforms.com-style
// URLs were blocked (403) from this sandbox, so exact endpoint paths, request
// field names, and header names below are our best reconstruction, NOT
// confirmed against a real API reference or sandbox account. Treat every
// string in this file as a placeholder to verify against FileForms's actual
// docs (or their onboarding engineer) before this talks to production —
// same posture as the deliberately-unseeded rows in state_fees.
const DEFAULT_BASE_URL = "https://api.fileforms.com/v1";

// Marketing copy claims all-50-state coverage; nothing state-specific to gate
// on until a real partner agreement says otherwise.
function supportsState(): boolean {
  return true;
}

interface FileFormsSubmitResponse {
  id: string;
}

interface FileFormsWebhookPayload {
  filing_id: string;
  event: "filing.submitted" | "filing.state_accepted" | "filing.state_rejected" | "filing.document_available";
  state_confirmation_id?: string;
  document_url?: string;
}

const STATUS_BY_EVENT: Record<FileFormsWebhookPayload["event"], FilingStatus> = {
  "filing.submitted": "submitted",
  "filing.state_accepted": "approved",
  "filing.state_rejected": "rejected",
  "filing.document_available": "approved",
};

export function createFileFormsProvider(apiKey: string, webhookSecret: string): FilingProvider {
  const baseUrl = process.env.FILEFORMS_BASE_URL || DEFAULT_BASE_URL;

  return {
    name: "fileforms",
    supportsState,

    async submitFormation(input: FormationSubmission) {
      const res = await fetch(`${baseUrl}/formations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          external_reference: input.registrationId,
          entity_name: input.entityName,
          entity_type: input.entityType,
          state: input.state,
          principal_address: input.address,
          registered_agent: input.registeredAgentName
            ? { name: input.registeredAgentName, address: input.registeredAgentAddress }
            : undefined,
          organizer_name: input.organizerName,
          notification_email: input.contactEmail,
        }),
      });

      if (!res.ok) {
        throw new Error(`FileForms formation submission failed: ${res.status} ${await res.text()}`);
      }

      const body = (await res.json()) as FileFormsSubmitResponse;
      return { providerFilingId: body.id };
    },

    verifyWebhookSignature(rawBody: string, signatureHeader: string | null) {
      if (!signatureHeader) return false;
      const expected = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
      const expectedBuf = Buffer.from(expected);
      const actualBuf = Buffer.from(signatureHeader);
      return expectedBuf.length === actualBuf.length && timingSafeEqual(expectedBuf, actualBuf);
    },

    parseWebhookEvent(rawBody: string): FilingWebhookEvent | null {
      let payload: FileFormsWebhookPayload;
      try {
        payload = JSON.parse(rawBody);
      } catch {
        return null;
      }
      const status = STATUS_BY_EVENT[payload.event];
      if (!status || !payload.filing_id) return null;
      return {
        providerFilingId: payload.filing_id,
        status,
        stateConfirmationId: payload.state_confirmation_id,
        stampedDocUrl: payload.document_url,
      };
    },
  };
}
