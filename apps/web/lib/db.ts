import { Pool } from "pg";

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

// Reuse the pool across hot reloads in dev instead of exhausting connections.
export const db = global._pgPool ?? createPool();
if (process.env.NODE_ENV !== "production") {
  global._pgPool = db;
}

export async function query<T = unknown>(text: string, params?: unknown[]) {
  const result = await db.query<T>(text, params as never[]);
  return result;
}
