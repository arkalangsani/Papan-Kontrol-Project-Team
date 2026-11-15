import { sql } from "@vercel/postgres";

// Satu baris saja (id = 1): hash sandi yang sudah diubah lewat aplikasi.
// Selama baris ini tidak ada, sandi yang berlaku adalah APP_PASSWORD.
let ready: Promise<unknown> | null = null;
function ensureTable() {
  ready ??= sql`
    CREATE TABLE IF NOT EXISTS app_auth (
      id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      password_hash TEXT NOT NULL,
      version BIGINT NOT NULL
    )
  `.catch((error) => {
    ready = null; // jangan menyimpan kegagalan, coba lagi di permintaan berikutnya
    throw error;
  });
  return ready;
}

export async function getStored(): Promise<{ hash: string; version: number } | null> {
  await ensureTable();
  const { rows } = await sql`SELECT password_hash, version FROM app_auth WHERE id = 1`;
  return rows[0] ? { hash: rows[0].password_hash, version: Number(rows[0].version) } : null;
}

export async function saveStored(hash: string, version: number): Promise<void> {
  await ensureTable();
  await sql`
    INSERT INTO app_auth (id, password_hash, version) VALUES (1, ${hash}, ${version})
    ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash, version = EXCLUDED.version
  `;
}
