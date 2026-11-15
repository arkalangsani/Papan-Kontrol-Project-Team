import { NextRequest, NextResponse } from "next/server";
import { changePassword, checkLogin, COOKIE_NAME, cookieOptions, createSession } from "@/lib/auth";

const MIN_LENGTH = 8;
const MAX_LENGTH = 200;

// Dijaga proxy.ts: hanya yang sudah login yang bisa sampai sini.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const current = typeof body.current === "string" ? body.current : "";
  const next = typeof body.next === "string" ? body.next : "";

  try {
    if (!current || !(await checkLogin(current)).ok) {
      return NextResponse.json({ error: "Kata sandi lama salah." }, { status: 401 });
    }
    if (next.length < MIN_LENGTH || next.length > MAX_LENGTH) {
      return NextResponse.json({ error: `Kata sandi baru harus ${MIN_LENGTH}-${MAX_LENGTH} karakter.` }, { status: 400 });
    }
    if (next === current) {
      return NextResponse.json({ error: "Kata sandi baru tidak boleh sama dengan yang lama." }, { status: 400 });
    }

    const version = await changePassword(next);
    // Sesi orang lain mati (versi berubah); yang mengganti diberi cookie baru supaya tetap masuk.
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, await createSession(version), cookieOptions);
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengubah kata sandi. Coba lagi." }, { status: 500 });
  }
}
