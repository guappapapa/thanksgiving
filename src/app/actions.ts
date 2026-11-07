"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import {
  createDietary,
  createRsvp,
  deleteDietary,
  deleteRsvp,
  updateDietary,
  updateRsvp,
  type DietaryInput,
  type RsvpInput,
} from "@/lib/db";
import { MAX_PLUS_ONES } from "@/lib/event";
import { getDeviceToken, getOrCreateDeviceToken } from "@/lib/session";

export type FormState = {
  ok: boolean;
  message: string;
  // Changes on every successful submit so the client can react to it.
  savedAt?: number;
};

const NOT_YOURS =
  "This entry can't be changed from this device. It may have been added from another phone or browser.";

function text(formData: FormData, key: string, max: number): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// ---------- Guests ----------

function parseRsvp(formData: FormData): RsvpInput | string {
  const name = text(formData, "name", 60);
  if (!name) return "Add your name.";

  const dish = text(formData, "dish", 80);
  if (!dish) return "Add what you're bringing.";

  const plusOnes = Number(text(formData, "plusOnes", 3));
  if (!Number.isInteger(plusOnes) || plusOnes < 0 || plusOnes > MAX_PLUS_ONES) {
    return `Plus ones should be 0 to ${MAX_PLUS_ONES}.`;
  }
  return { name, dish, plusOnes };
}

// Adds a new guest, or updates one when the form includes an `id`.
export async function saveRsvp(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const input = parseRsvp(formData);
  if (typeof input === "string") return { ok: false, message: input };

  const id = text(formData, "id", 64);
  try {
    if (id) {
      const token = await getDeviceToken();
      if (!token || !(await updateRsvp(id, token, input))) {
        return { ok: false, message: NOT_YOURS };
      }
    } else {
      await createRsvp(randomUUID(), await getOrCreateDeviceToken(), input);
    }
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Something went wrong. Try again?" };
  }

  revalidatePath("/");
  return { ok: true, message: "", savedAt: Date.now() };
}

export async function removeRsvp(formData: FormData): Promise<void> {
  const id = text(formData, "id", 64);
  const token = await getDeviceToken();
  if (id && token) await deleteRsvp(id, token);
  revalidatePath("/");
}

// ---------- Allergies / dietary wishes ----------

function parseDietary(formData: FormData): DietaryInput | string {
  const name = text(formData, "name", 60);
  if (!name) return "Add your name.";

  const note = text(formData, "note", 200);
  if (!note) return "Add the allergy or dietary wish.";
  return { name, note };
}

export async function saveDietary(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const input = parseDietary(formData);
  if (typeof input === "string") return { ok: false, message: input };

  const id = text(formData, "id", 64);
  try {
    if (id) {
      const token = await getDeviceToken();
      if (!token || !(await updateDietary(id, token, input))) {
        return { ok: false, message: NOT_YOURS };
      }
    } else {
      await createDietary(randomUUID(), await getOrCreateDeviceToken(), input);
    }
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Something went wrong. Try again?" };
  }

  revalidatePath("/");
  return { ok: true, message: "", savedAt: Date.now() };
}

export async function removeDietary(formData: FormData): Promise<void> {
  const id = text(formData, "id", 64);
  const token = await getDeviceToken();
  if (id && token) await deleteDietary(id, token);
  revalidatePath("/");
}
