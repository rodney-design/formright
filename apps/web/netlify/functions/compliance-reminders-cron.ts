import type { Config } from "@netlify/functions";

// Replaces vercel.json's crons entry (Vercel Cron doesn't exist on Netlify).
// Calls the existing Next.js route with the same Bearer auth it already checks;
// process.env.URL is the site's canonical URL, set automatically by Netlify.
export default async () => {
  const secret = process.env.CRON_SECRET;
  const baseUrl = process.env.URL;
  if (!secret || !baseUrl) {
    console.error("compliance-reminders cron: CRON_SECRET or URL not set, skipping");
    return;
  }

  const res = await fetch(`${baseUrl}/api/cron/compliance-reminders`, {
    headers: { Authorization: `Bearer ${secret}` },
  });

  if (!res.ok) {
    console.error(`compliance-reminders cron failed: ${res.status} ${await res.text()}`);
  }
};

export const config: Config = {
  schedule: "0 13 * * *",
};
