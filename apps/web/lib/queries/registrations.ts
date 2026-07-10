import "server-only";
import { query } from "@/lib/db";
import type { RegistrationRow } from "@/lib/entities/orgDataFromRegistration";

export interface Registration extends RegistrationRow {
  user_id: string;
  plan: string;
  status: string;
  amount_cents: number;
  state_fee_cents: number | null;
  created_at: string;
}

export async function getRegistrationsForUser(userId: string): Promise<Registration[]> {
  const result = await query<Registration>(
    "SELECT * FROM registrations WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return result.rows;
}

export async function getRegistrationById(id: string): Promise<Registration | null> {
  const result = await query<Registration>("SELECT * FROM registrations WHERE id = $1", [id]);
  return result.rows[0] ?? null;
}

export interface Payment {
  id: string;
  registration_id: string;
  stripe_payment_intent_id: string;
  amount_cents: number;
  state_fee_cents: number | null;
  status: string;
  created_at: string;
}

export async function getPaymentsForUser(userId: string): Promise<Payment[]> {
  const result = await query<Payment>(
    `SELECT p.* FROM payments p
     JOIN registrations r ON r.id = p.registration_id
     WHERE r.user_id = $1
     ORDER BY p.created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function getAllRegistrations(): Promise<Registration[]> {
  const result = await query<Registration>("SELECT * FROM registrations ORDER BY created_at DESC");
  return result.rows;
}
