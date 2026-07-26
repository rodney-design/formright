# Temporary marketing site

A single self-contained `index.html` — no build step, no dependencies on the
main Next.js app. Deployable anywhere as-is, independent of the Supabase/
Vercel/Stripe provisioning the real app still needs (see the root
`CLAUDE.md`).

## Before you publish

Two placeholders to swap:

- `hello@formright.com` — appears twice (the "Get Notified at Launch" CTA
  and the footer contact link). Point it at a real inbox before this goes
  live, or replace the mailto links with a real signup form if you want to
  actually collect emails somewhere durable.
- "Launching August 2026" (top-right of the header) — matches the internal
  target date in `CLAUDE.md`. Update or remove if that changes.

Content (entity types, PBC/benefit-purpose language, "not a law firm"
disclaimer) is pulled directly from the real marketing copy in
`apps/web/components/marketing/` to stay consistent — if that copy changes,
this won't pick it up automatically since it's a standalone file.

## Deploying

Any static host works. A few options:

- **Vercel**: `npx vercel deploy` from inside this directory (as its own
  project, separate from the `apps/web` Vercel project).
- **Netlify**: drag-and-drop this folder onto the Netlify dashboard, or
  `netlify deploy` from inside it.
- **Anywhere else**: it's one HTML file with no build step — any static
  file host (S3 + CloudFront, GitHub Pages, Cloudflare Pages) works by
  just uploading `index.html`.

## Retiring it

Once the real app is live, point the domain at the Vercel deployment for
`apps/web` instead and this directory can be deleted.
