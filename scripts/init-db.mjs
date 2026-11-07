// Creates the rsvps and dietary tables. Safe to run more than once.
// Usage: yarn db:init   (reads DATABASE_URL from .env.local)
import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

const sql = neon(connectionString);

await sql`
  CREATE TABLE IF NOT EXISTS rsvps (
    id          TEXT PRIMARY KEY,
    edit_token  TEXT NOT NULL,
    name        TEXT NOT NULL,
    status      TEXT NOT NULL CHECK (status IN ('yes', 'maybe', 'no')),
    guests      INTEGER NOT NULL DEFAULT 1 CHECK (guests BETWEEN 0 AND 20),
    dish        TEXT NOT NULL DEFAULT '',
    category    TEXT,
    note        TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS dietary (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    note        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

// Added later: who created each allergy entry (see src/lib/session.ts).
await sql`ALTER TABLE dietary ADD COLUMN IF NOT EXISTS edit_token TEXT`;

console.log("rsvps and dietary tables are ready.");
