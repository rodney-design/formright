-- registrations.notes holds structured JSON written at checkout (addons,
-- IRS screening answers, governance preferences, registered-agent info) that
-- the Stripe webhook and doc engine both read back. The admin dashboard's
-- "Internal Notes" textarea was writing free text into that same column,
-- silently destroying the JSON on save. Give admin free-text notes their own
-- column instead.

ALTER TABLE registrations ADD COLUMN admin_notes TEXT;
