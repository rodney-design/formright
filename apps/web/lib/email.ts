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

export async function sendFirmInviteEmail(to: string, firmName: string, inviterEmail: string): Promise<void> {
  ensureInitialized();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  await sgMail.send({
    to,
    from: fromAddress(),
    subject: `You've been invited to ${firmName} on FormRight`,
    text: `${inviterEmail} invited you to join ${firmName}'s team on FormRight. Sign in with this email address to accept: ${appUrl}/auth/login`,
    html: `<p><strong>${inviterEmail}</strong> invited you to join <strong>${firmName}</strong>'s team on FormRight.</p><p>Sign in with this email address to accept: <a href="${appUrl}/auth/login">${appUrl}/auth/login</a></p>`,
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
    html: `<p>Reminder: <strong>${orgName}</strong>'s <strong>${label}</strong> is due on <strong>${formattedDate}</strong> (${daysUntil} days from now).</p><p>Check your <a href="${appUrl}/dashboard">compliance calendar</a>.</p>`,
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
