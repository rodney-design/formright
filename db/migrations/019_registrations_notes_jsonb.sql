-- registrations.notes has always held structured data (addons, IRS
-- screening answers, governance preferences, registered-agent info) written
-- by checkout as a JSON string into a plain TEXT column, then JSON.parse'd
-- back out in half a dozen places — while board/address/branding, storing
-- the same kind of data, are JSONB. Move notes to JSONB too for queryability
-- and to match the pattern.
--
-- Uses a safe-cast helper rather than a bare `USING notes::jsonb` because a
-- small number of existing rows may predate the admin_notes split (see
-- 017_registration_admin_notes.sql / C4) and could hold non-JSON free text
-- from the admin "Internal Notes" bug that column was introduced to fix —
-- a bare cast would abort the whole migration on the first bad row.
CREATE OR REPLACE FUNCTION _safe_jsonb(input TEXT) RETURNS JSONB AS $$
BEGIN
  RETURN input::jsonb;
EXCEPTION WHEN others THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

ALTER TABLE registrations ALTER COLUMN notes TYPE JSONB USING _safe_jsonb(notes);

DROP FUNCTION _safe_jsonb(TEXT);
