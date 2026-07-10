import { Pool, type QueryResultRow } from "pg";

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
