import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function bucket(): string {
  const name = process.env.SUPABASE_STORAGE_BUCKET;
  if (!name) throw new Error("SUPABASE_STORAGE_BUCKET is not set");
  return name;
}

function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("SUPABASE_URL is not set");
  if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  // The service-role key bypasses row-level security, which is required for
  // server-side access to a private bucket — never expose it to the client.
  _client = createClient(url, serviceRoleKey);
  return _client;
}

export async function uploadDocument(key: string, body: Buffer, contentType: string): Promise<void> {
  const { error } = await getClient()
    .storage.from(bucket())
    .upload(key, body, { contentType, upsert: true });
  if (error) throw error;
}

const SIGNED_URL_TTL_SECONDS = 15 * 60;

export async function getDocumentUrl(key: string): Promise<string> {
  const { data, error } = await getClient()
    .storage.from(bucket())
    .createSignedUrl(key, SIGNED_URL_TTL_SECONDS);
  if (error) throw error;
  return data.signedUrl;
}
