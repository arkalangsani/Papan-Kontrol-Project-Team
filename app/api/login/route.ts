import { NextRequest, NextResponse } from "next/server";
import { authConfigured, checkLogin, COOKIE_NAME, cookieOptions, createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!authConfigured()) {
    return NextResponse.json({ error: "Login belum dikonfigurasi di server." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";
  if (!password) return NextResponse.json({ error: "Kata sandi salah." }, { status: 401 });

  try {
    const { ok, version } = await checkLogin(password);
    if (!ok) return NextResponse.json({ error: "Kata sandi salah." }, { status: 401 });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, await createSession(version), cookieOptions);
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memeriksa kata sandi. Coba lagi." }, { status: 500 });
  }
}
