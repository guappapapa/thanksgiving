import { neon } from "@neondatabase/serverless";
import type { DietaryEntry, Rsvp } from "./event";

function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return neon(connectionString);
}

// Ownership: each row's `edit_token` holds the device key of the browser that
// created it. Updates and deletes only match when that key is supplied.

// ---------- Guests ----------

// `guests` in the table counts the person plus their plus-ones.
type RsvpRow = {
  id: string;
  name: string;
  dish: string;
  guests: number;
  mine: boolean | null;
};

export type RsvpInput = Pick<Rsvp, "name" | "dish" | "plusOnes">;

export async function getAllRsvps(deviceToken: string | null): Promise<Rsvp[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, name, dish, guests, (edit_token = ${deviceToken}) AS mine
    FROM rsvps
    WHERE status = 'yes'
    ORDER BY created_at ASC
  `) as RsvpRow[];
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    dish: row.dish,
    plusOnes: Math.max(0, row.guests - 1),
    mine: row.mine === true,
  }));
}

export async function createRsvp(
  id: string,
  deviceToken: string,
  input: RsvpInput,
): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO rsvps (id, edit_token, name, status, guests, dish)
    VALUES (${id}, ${deviceToken}, ${input.name}, 'yes', ${input.plusOnes + 1}, ${input.dish})
  `;
}

export async function updateRsvp(
  id: string,
  deviceToken: string,
  input: RsvpInput,
): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    UPDATE rsvps
    SET name = ${input.name}, dish = ${input.dish}, guests = ${input.plusOnes + 1}, updated_at = now()
    WHERE id = ${id} AND edit_token = ${deviceToken}
    RETURNING id
  `;
  return rows.length > 0;
}

export async function deleteRsvp(id: string, deviceToken: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM rsvps WHERE id = ${id} AND edit_token = ${deviceToken}`;
}

// ---------- Allergies / dietary wishes ----------

export type DietaryInput = Pick<DietaryEntry, "name" | "note">;

export async function getAllDietary(
  deviceToken: string | null,
): Promise<DietaryEntry[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, name, note, (edit_token = ${deviceToken}) AS mine
    FROM dietary
    ORDER BY created_at ASC
  `) as (Omit<DietaryEntry, "mine"> & { mine: boolean | null })[];
  return rows.map((row) => ({ ...row, mine: row.mine === true }));
}

export async function createDietary(
  id: string,
  deviceToken: string,
  input: DietaryInput,
): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO dietary (id, edit_token, name, note)
    VALUES (${id}, ${deviceToken}, ${input.name}, ${input.note})
  `;
}

export async function updateDietary(
  id: string,
  deviceToken: string,
  input: DietaryInput,
): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    UPDATE dietary SET name = ${input.name}, note = ${input.note}
    WHERE id = ${id} AND edit_token = ${deviceToken}
    RETURNING id
  `;
  return rows.length > 0;
}

export async function deleteDietary(id: string, deviceToken: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM dietary WHERE id = ${id} AND edit_token = ${deviceToken}`;
}
