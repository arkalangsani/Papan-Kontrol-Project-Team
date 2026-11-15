// Login sederhana: satu kata sandi bersama (APP_PASSWORD). Sesi = cookie yang
// ditandatangani HMAC dengan AUTH_SECRET. Pakai Web Crypto supaya jalan di
// proxy.ts maupun route handler.
// shortcut: satu sandi untuk semua orang & tanpa batas percobaan login, ganti
// ke akun per orang + rate limit kalau aplikasi dipakai lebih luas.
import { getStored, saveStored } from "./auth-store";

export const COOKIE_NAME = "sesi";
export const SESSION_SECONDS = 60 * 60 * 24 * 7; // 7 hari

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_SECONDS,
};

const enc = new TextEncoder();

// Tertutup secara bawaan: tanpa konfigurasi, semua akses ditolak (bukan dibuka).
export function authConfigured(): boolean {
  return Boolean(process.env.APP_PASSWORD) && (process.env.AUTH_SECRET ?? "").length >= 16;
}

function hmacKey() {
  return crypto.subtle.importKey("raw", enc.encode(process.env.AUTH_SECRET!), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

const toHex = (buf: ArrayBuffer | Uint8Array) =>
  Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
const fromHex = (hex: string) => Uint8Array.from(hex.match(/../g) ?? [], (h) => parseInt(h, 16));

// verify() membandingkan dengan waktu konstan, jadi aman dari serangan timing.
export async function passwordMatches(input: string): Promise<boolean> {
  const key = await hmacKey();
  const expected = await crypto.subtle.sign("HMAC", key, enc.encode(process.env.APP_PASSWORD!));
  return crypto.subtle.verify("HMAC", key, expected, enc.encode(input));
}

// --- Sandi yang diubah lewat aplikasi: disimpan sebagai hash PBKDF2 + salt. ---
const PBKDF2_ITERATIONS = 600_000;

async function derive(password: string, salt: BufferSource, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  return toHex(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256));
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toHex(salt)}$${await derive(password, salt, PBKDF2_ITERATIONS)}`;
}

async function verifyHash(password: string, stored: string): Promise<boolean> {
  const [scheme, iterations, saltHex, hash] = stored.split("$");
  if (scheme !== "pbkdf2" || !iterations || !saltHex || !hash) return false;
  const derived = await derive(password, fromHex(saltHex), Number(iterations));
  if (derived.length !== hash.length) return false;
  let diff = 0; // perbandingan waktu konstan
  for (let i = 0; i < hash.length; i++) diff |= derived.charCodeAt(i) ^ hash.charCodeAt(i);
  return diff === 0;
}

// Sandi yang tersimpan di database (jika pernah diubah) mengalahkan APP_PASSWORD.
// `version` ikut ditanam di cookie, jadi mengubah sandi mencabut semua sesi lama.
export async function checkLogin(input: string): Promise<{ ok: boolean; version: number }> {
  const stored = await getStored();
  if (stored) return { ok: await verifyHash(input, stored.hash), version: stored.version };
  return { ok: await passwordMatches(input), version: 0 };
}

export async function currentVersion(): Promise<number> {
  return (await getStored())?.version ?? 0;
}

export async function changePassword(next: string): Promise<number> {
  const version = Date.now();
  await saveStored(await hashPassword(next), version);
  return version;
}

export async function createSession(version: number): Promise<string> {
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  const payload = `${exp}.${version}`;
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(payload));
  return `${payload}.${toHex(sig)}`;
}

// Mengembalikan versi sandi di dalam cookie kalau tanda tangan dan masa berlakunya sah,
// selain itu null. Pemanggil tetap harus mencocokkan versinya dengan currentVersion().
export async function parseSession(token: string | undefined): Promise<number | null> {
  if (!token) return null;
  const [exp, version, sig] = token.split(".");
  if (!exp || !version || !sig || !(Number(exp) > Date.now() / 1000)) return null;
  const valid = await crypto.subtle.verify("HMAC", await hmacKey(), fromHex(sig), enc.encode(`${exp}.${version}`));
  return valid ? Number(version) : null;
}
