import "server-only";
import sgMail from "@sendgrid/mail";

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

export async function sendRegistrationConfirmationEmail(
  to: string,
  orgName: string,
  registrationId: string
): Promise<void> {
  ensureInitialized();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  await sgMail.send({
    to,
    from: fromAddress(),
    subject: `Your FormRight Registration — ${orgName}`,
    text: `Thanks for choosing FormRight! Your registration ${registrationId} for ${orgName} has been received and payment confirmed. Track its status in your dashboard: ${appUrl}/dashboard`,
    html: `<p>Thanks for choosing FormRight! Your registration <strong>${registrationId}</strong> for <strong>${orgName}</strong> has been received and payment confirmed.</p><p>Track its status in your <a href="${appUrl}/dashboard">dashboard</a>.</p>`,
  });
}
