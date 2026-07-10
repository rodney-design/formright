import "server-only";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let _client: S3Client | null = null;

function bucket(): string {
  const name = process.env.S3_BUCKET;
  if (!name) throw new Error("S3_BUCKET is not set");
  return name;
}

function getClient(): S3Client {
  if (_client) return _client;
  const region = process.env.AWS_REGION;
  if (!region) throw new Error("AWS_REGION is not set");
  // Credentials are picked up from the standard AWS SDK chain (env vars,
  // shared config, or an attached IAM role) — no explicit config needed here.
  _client = new S3Client({ region });
  return _client;
}

export async function uploadDocument(key: string, body: Buffer, contentType: string): Promise<void> {
  await getClient().send(
    new PutObjectCommand({ Bucket: bucket(), Key: key, Body: body, ContentType: contentType })
  );
}

const PRESIGN_TTL_SECONDS = 15 * 60;

export async function getDocumentUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: bucket(), Key: key });
  return getSignedUrl(getClient(), command, { expiresIn: PRESIGN_TTL_SECONDS });
}
