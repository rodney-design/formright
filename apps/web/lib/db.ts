import { Pool, type QueryResultRow } from "pg";

export interface TransactionClient {
  query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<import("pg").QueryResult<T>>;
}

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  return new Pool({ connectionString });
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

// Runs `fn` against a single checked-out client wrapped in BEGIN/COMMIT, so a
// multi-step write (e.g. firm + user + membership inserts) either lands
// entirely or not at all instead of leaving a partial row behind on a
// mid-sequence failure. `fn` must route every query through the `tx` it's
// given, not the module-level `query()` above — that one pulls a *different*
// connection from the pool and wouldn't see this transaction's uncommitted
// writes or be rolled back with it.
export async function withTransaction<T>(fn: (tx: TransactionClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn({
      query: (text, params) => client.query(text, params as never[]),
    });
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
