-- documents.s3_key was nullable in the schema but every insert path
-- (lib/doc-engine/generateAndStore.ts) always provides it, and every read
-- (lib/queries/documents.ts) treats it as required. Tighten the constraint
-- to match actual usage.
ALTER TABLE documents ALTER COLUMN s3_key SET NOT NULL;
