-- Rollback for migrations/0000_accounts_billing.sql.
-- DESTRUCTIVE: drops every account, subscription, payment and personal-data row.
-- Only for a fresh environment or after a verified backup/branch (see RUNBOOK.md). Run in one transaction:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -1 -f lib/db/rollback/0000_accounts_billing.down.sql
DROP TABLE IF EXISTS "webhook_events";
DROP TABLE IF EXISTS "payments";
DROP TABLE IF EXISTS "bookmarks";
DROP TABLE IF EXISTS "user_progress";
DROP TABLE IF EXISTS "study_plans";
DROP TABLE IF EXISTS "rate_limits";
DROP TABLE IF EXISTS "subscriptions";
DROP TABLE IF EXISTS "users";
DROP TYPE IF EXISTS "subscription_status";
DROP TYPE IF EXISTS "subscription_source";
DROP TYPE IF EXISTS "progress_status";
DROP TYPE IF EXISTS "role";
DROP TYPE IF EXISTS "plan";
DROP TYPE IF EXISTS "qualification";
DELETE FROM drizzle.__drizzle_migrations WHERE hash IS NOT NULL AND id = (SELECT min(id) FROM drizzle.__drizzle_migrations);
