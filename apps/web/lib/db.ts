import { Pool, type PoolClient, type QueryResultRow } from "pg";
import * as Sentry from "@sentry/nextjs";

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const pool = new Pool({ connectionString });
  // BUG (fixed): node-postgres emits an 'error' event on the Pool itself
  // whenever an IDLE pooled client hits a backend error or the connection
  // is dropped (a network blip, Supabase's pooler recycling a connection,
  // etc.) — this is documented pg behavior, not an edge case. With no
  // listener attached, Node treats that emitted 'error' as an uncaught
  // exception and crashes the *entire process*, taking down every
  // in-flight request, not just whichever one happened to be using that
  // connection. Every pg Pool needs an error handler for exactly this
  // reason — report and move on, don't let it propagate.
  pool.on("error", (err) => {
    console.error("Unexpected error on idle Postgres client:", err);
    Sentry.captureException(err);
  });
  return pool;
}

// Lazily create the pool on first use (not at module load) so importing this
// module doesn't require DATABASE_URL to be set, e.g. during `next build`
// static analysis of pages that only *conditionally* touch the DB at request
// time. Reuse the pool across hot reloads in dev instead of exhausting connections.
function getPool(): Pool {
  if (!global._pgPool) {
    global._pgPool = createPool();
  }
  return global._pgPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) {
  const result = await getPool().query<T>(text, params as never[]);
  return result;
}

// For call sites that need more than one statement to commit atomically
// (e.g. an advisory lock held across a check-then-act sequence) — `query()`
// checks out a connection per call, so a lock or transaction started on one
// statement wouldn't still be held by the next. Runs `fn` against a single
// dedicated client and always releases it back to the pool.
export async function withClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}
