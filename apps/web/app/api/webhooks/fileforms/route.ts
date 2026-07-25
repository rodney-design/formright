import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getFilingProviderByName } from "@/lib/state-filing/providers";
import { getStateFilingByProviderFilingId, updateStateFiling } from "@/lib/queries/stateFilings";
import { uploadDocument } from "@/lib/storage";

export const runtime = "nodejs";

// Inbound status callback from FileForms (see lib/state-filing/providers/fileforms.ts
// for the caveat that the exact payload/header names here are reconstructed
// from public docs, not verified against a real sandbox). Mirrors the Stripe
// webhook's shape: verify signature, look up the row by provider filing ID,
// update status. If FileForms hosts the stamped certificate at a URL, fetch
// it once and re-host it in Supabase Storage so client downloads
// (getDocumentUrl) don't depend on the vendor's link staying valid.
export async function POST(req: NextRequest) {
  const provider = getFilingProviderByName("fileforms");
  if (!provider) {
    return NextResponse.json({ error: "Provider not configured" }, { status: 503 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-fileforms-signature");
  if (!provider.verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = provider.parseWebhookEvent(rawBody);
  if (!event) {
    return NextResponse.json({ error: "Unrecognized event" }, { status: 400 });
  }

  const filing = await getStateFilingByProviderFilingId(provider.name, event.providerFilingId);
  if (!filing) {
    return NextResponse.json({ error: "No matching state filing" }, { status: 404 });
  }

  let stampedDocS3Key: string | undefined;
  if (event.stampedDocUrl) {
    try {
      const docRes = await fetch(event.stampedDocUrl);
      if (docRes.ok) {
        const buffer = Buffer.from(await docRes.arrayBuffer());
        stampedDocS3Key = `state-filings/${filing.id}/stamped_${Date.now()}.pdf`;
        await uploadDocument(stampedDocS3Key, buffer, docRes.headers.get("content-type") || "application/pdf");
      }
    } catch (err) {
      // The status update below still matters even if re-hosting the
      // document fails — don't let a storage hiccup mask a filing approval.
      console.error(`Failed to re-host stamped document for filing ${filing.id}:`, err);
      Sentry.captureException(err);
    }
  }

  await updateStateFiling(filing.id, {
    filingStatus: event.status,
    stateConfirmationId: event.stateConfirmationId,
    stampedDocS3Key,
  });

  return NextResponse.json({ received: true });
}
