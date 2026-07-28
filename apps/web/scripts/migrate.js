#!/usr/bin/env node
// Applies any not-yet-applied files in db/migrations/ to DATABASE_URL,
// tracked in a schema_migrations table. Runs before every Netlify production
// build (see netlify.toml) so a merged schema change never sits un-applied
// against the live database the way migrations 017-019 did on 2026-07-28
// (deployed code assumed admin_notes/notes-jsonb/s3_key-not-null that the
// live DB didn't have yet — silently broke registered-agent fulfillment and
// admin notes saves until caught and fixed by hand).
//
// Migrations 001-016 are historical only — 001_init.sql pulls in the entire
// current db/schema.sql, so replaying 002+ after it fails with "already
// exists" (see CLAUDE.md's "Known inconsistency" note). This runner never
// executes any of them: the first time it runs against a database that
// already has a `registrations` table, it stamps every migration file
// present as already-applied (baseline) without running its SQL. Only a
// genuinely fresh database (no `registrations` table yet) gets bootstrapped
// — via db/schema.sql, the actual source of truth for a new install — then
// gets the same stamp. Every migration from 017 onward is written to be a
// small, safely-replayable ALTER, so only ones the stamp doesn't already
// cover ever actually execute.
//
// Deploy previews and branch deploys share the same database as production
// (see README's "Environment variables" note) — this only ever runs for the
// actual production context, so a PR that's never merged can't apply schema
// changes to the live database.

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..", "..", "..");
const MIGRATIONS_DIR = path.join(REPO_ROOT, "db", "migrations");
const SCHEMA_SQL = path.join(REPO_ROOT, "db", "schema.sql");

async function main() {
  if (process.env.CONTEXT && process.env.CONTEXT !== "production") {
    console.log(`migrate: skipping (Netlify context is "${process.env.CONTEXT}", not production)`);
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log("migrate: DATABASE_URL not set, skipping (nothing to migrate against)");
    return;
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         version TEXT PRIMARY KEY,
         applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
       )`
    );

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    const { rows: appliedRows } = await client.query("SELECT version FROM schema_migrations");
    const applied = new Set(appliedRows.map((r) => r.version));

    if (applied.size === 0) {
      const { rows } = await client.query("SELECT to_regclass('public.registrations') AS reg");
      const hasExistingSchema = rows[0]?.reg !== null;

      if (!hasExistingSchema) {
        console.log("migrate: fresh database detected, loading db/schema.sql");
        await client.query(fs.readFileSync(SCHEMA_SQL, "utf8"));
      } else {
        console.log("migrate: existing database detected, stamping current migrations as baseline");
      }

      // Either way, everything in db/migrations/ right now is already
      // reflected in the database at this point (just loaded from
      // schema.sql, or already there beforehand) — stamp it as applied
      // without re-running any of it.
      for (const file of files) {
        await client.query("INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING", [file]);
      }
      console.log(`migrate: stamped ${files.length} migration(s) as baseline`);
      return;
    }

    const pending = files.filter((f) => !applied.has(f));
    if (pending.length === 0) {
      console.log("migrate: up to date, nothing to apply");
      return;
    }

    for (const file of pending) {
      console.log(`migrate: applying ${file}`);
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [file]);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`migrate: failed applying ${file}: ${err.message}`);
      }
    }
    console.log(`migrate: applied ${pending.length} migration(s)`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
