import "server-only";
import sgMail from "@sendgrid/mail";

// Every email HTML body below interpolates values a user ultimately
// controls (org name from the onboarding wizard, firm name, inviter email).
// Without escaping, an org name like `<a href="https://evil...">Verify your
// payment</a>` would render as a live link in mail sent from FormRight's
// verified SendGrid domain — a phishing vector. Plain-text bodies don't need
// this; only apply it to values interpolated into `html`.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

let initialized = false;

function ensureInitialized() {
  if (initialized) return;
  const key = process.env.SENDGRID_API_KEY;
  if (!key) throw new Error("SENDGRID_API_KEY is not set");
  sgMail.setApiKey(key);
  initialized = true;
}

function fromAddress(): string {
  const from = process.env.SENDGRID_FROM_EMAIL;
  if (!from) throw new Error("SENDGRID_FROM_EMAIL is not set");
  return from;
}

export async function sendFirmInviteEmail(to: string, firmName: string, inviterEmail: string): Promise<void> {
  ensureInitialized();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  await sgMail.send({
    to,
    from: fromAddress(),
    subject: `You've been invited to ${firmName} on FormRight`,
    text: `${inviterEmail} invited you to join ${firmName}'s team on FormRight. Sign in with this email address to accept: ${appUrl}/auth/login`,
    html: `<p><strong>${escapeHtml(inviterEmail)}</strong> invited you to join <strong>${escapeHtml(firmName)}</strong>'s team on FormRight.</p><p>Sign in with this email address to accept: <a href="${appUrl}/auth/login">${appUrl}/auth/login</a></p>`,
  });
}

export async function sendMagicLinkEmail(to: string, verifyUrl: string): Promise<void> {
  ensureInitialized();
  await sgMail.send({
    to,
    from: fromAddress(),
    subject: "Your FormRight sign-in link",
    text: `Sign in to FormRight: ${verifyUrl}\n\nThis link expires in 15 minutes. If you didn't request this, you can ignore this email.`,
    html: `<p>Click below to sign in to FormRight:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 15 minutes. If you didn't request this, you can ignore this email.</p>`,
  });
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  annual_report: "Annual Report",
  benefit_report: "Annual Benefit Report",
  "2553_deadline": "IRS Form 2553 (S-Corp Election) Deadline",
  "990n": "IRS Form 990-N (e-Postcard)",
  charitable_solicitation_renewal: "Charitable Solicitation Registration Renewal",
};

export async function sendComplianceReminderEmail(
  to: string,
  orgName: string,
  eventType: string,
  dueDate: string,
  daysUntil: number
): Promise<void> {
  ensureInitialized();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const label = EVENT_TYPE_LABELS[eventType] ?? eventType;
  const formattedDate = new Date(dueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  await sgMail.send({
    to,
    from: fromAddress(),
    subject: `${label} due in ${daysUntil} days — ${orgName}`,
    text: `Reminder: ${orgName}'s ${label} is due on ${formattedDate} (${daysUntil} days from now). Check your compliance calendar: ${appUrl}/dashboard`,
    html: `<p>Reminder: <strong>${escapeHtml(orgName)}</strong>'s <strong>${label}</strong> is due on <strong>${formattedDate}</strong> (${daysUntil} days from now).</p><p>Check your <a href="${appUrl}/dashboard">compliance calendar</a>.</p>`,
  });
}

export async function sendRegistrationConfirmationEmail(
  to: string,
  orgName: string,
  registrationId: string
): Promise<void> {
  ensureInitialized();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  // Comply upsell CTA (System 1b) — links back to /onboard/success, which
  // renders the same ComplyUpsellCard the founder saw right after checkout,
  // rather than a separate GET-triggers-a-charge endpoint.
  const complyUrl = `${appUrl}/onboard/success?registration=${registrationId}`;
  await sgMail.send({
    to,
    from: fromAddress(),
    subject: `Your FormRight Registration — ${orgName}`,
    text: `Thanks for choosing FormRight! Your registration ${registrationId} for ${orgName} has been received and payment confirmed. Track its status in your dashboard: ${appUrl}/dashboard\n\nDon't miss a deadline — add FormRight Comply for automatic compliance reminders: ${complyUrl}`,
    html: `<p>Thanks for choosing FormRight! Your registration <strong>${escapeHtml(registrationId)}</strong> for <strong>${escapeHtml(orgName)}</strong> has been received and payment confirmed.</p><p>Track its status in your <a href="${appUrl}/dashboard">dashboard</a>.</p><p style="margin-top:24px;padding:16px;border:1px solid #00897B;border-radius:8px;"><strong>Don't miss your first compliance deadline.</strong><br/>FormRight Comply tracks your annual report and IRS deadlines automatically, with reminders 90/60/30 days out.</p><p><a href="${complyUrl}" style="display:inline-block;background:#00897B;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Add FormRight Comply — $149/yr</a></p>`,
  });
}
