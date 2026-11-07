import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";

// Each browser gets a random, private "device key" the first time it adds
// something. Every entry stores the key of the browser that made it, so on a
// later visit that browser can edit or remove its own entries (and only those).
// The key is httpOnly and never sent to the page itself.
const COOKIE_NAME = "device";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function getDeviceToken(): Promise<string | null> {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  return value && /^[a-f0-9]{48}$/.test(value) ? value : null;
}

// Only callable from Server Actions (cookies can't be set while rendering).
export async function getOrCreateDeviceToken(): Promise<string> {
  const existing = await getDeviceToken();
  if (existing) return existing;

  const token = randomBytes(24).toString("hex");
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return token;
}
