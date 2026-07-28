import "server-only";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { query } from "./db";

const SESSION_COOKIE = "fr_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAGIC_LINK_TTL_MS = 15 * 60 * 1000; // 15 minutes

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: "client" | "admin" | "super_admin" | "contractor";
}

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return secret;
}

// ── Magic link request/verify ──────────────────────────────────────────────
// Replaces the prototype's demo bypass (any email/password → dashboard).

// Only the hash is ever persisted (users.magic_link_token) — same pattern as
// lib/queries/apiKeys.ts — so a DB read (leak, backup exposure, SQL-read
// compromise) can't be turned into a one-click account takeover the way a
// plaintext token could.
function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export async function createMagicLinkToken(email: string, name?: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiry = new Date(Date.now() + MAGIC_LINK_TTL_MS);

  const existing = await query<{ id: string }>("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    await query("UPDATE users SET magic_link_token = $1, token_expiry = $2 WHERE email = $3", [
      tokenHash,
      expiry,
      email,
    ]);
  } else {
    await query(
      "INSERT INTO users (email, name, magic_link_token, token_expiry) VALUES ($1, $2, $3, $4)",
      [email, name ?? null, tokenHash, expiry]
    );
  }
  return token;
}

export async function consumeMagicLinkToken(token: string): Promise<SessionUser | null> {
  const result = await query<{
    id: string;
    email: string;
    name: string | null;
    role: SessionUser["role"];
    token_expiry: string;
  }>(
    "SELECT id, email, name, role, token_expiry FROM users WHERE magic_link_token = $1",
    [hashToken(token)]
  );
  const user = result.rows[0];
  if (!user) return null;
  if (new Date(user.token_expiry).getTime() < Date.now()) return null;

  await query("UPDATE users SET magic_link_token = NULL, token_expiry = NULL WHERE id = $1", [
    user.id,
  ]);

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

// ── Sessions ──────────────────────────────────────────────────────────────

export async function createSession(userId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const token = jwt.sign({ sub: userId }, jwtSecret(), { expiresIn: "30d" });

  await query("INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)", [
    userId,
    token,
    expiresAt,
  ]);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await query("DELETE FROM sessions WHERE token = $1", [token]);
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    jwt.verify(token, jwtSecret());
  } catch {
    return null;
  }

  const result = await query<{
    id: string;
    email: string;
    name: string | null;
    role: SessionUser["role"];
    expires_at: string;
  }>(
    `SELECT u.id, u.email, u.name, u.role, s.expires_at
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = $1`,
    [token]
  );
  const row = result.rows[0];
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;

  return { id: row.id, email: row.email, name: row.name, role: row.role };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin" && user.role !== "super_admin") {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireContractor(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "contractor") {
    throw new Error("Forbidden");
  }
  return user;
}
