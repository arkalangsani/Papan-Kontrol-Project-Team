import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authConfigured, COOKIE_NAME, currentVersion, parseSession } from "@/lib/auth";

// Menjaga semua halaman dan API. Hanya /login dan /api/login yang terbuka.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/login" || pathname === "/api/login") return NextResponse.next();

  if (!authConfigured()) {
    return new NextResponse("Login belum dikonfigurasi: isi APP_PASSWORD dan AUTH_SECRET (min. 16 karakter).", {
      status: 503,
    });
  }

  // Tanda tangan dicek dulu (murah); database hanya dibaca untuk cookie yang sah, supaya
  // sesi lama mati begitu sandi diubah.
  const version = await parseSession(request.cookies.get(COOKIE_NAME)?.value);
  if (version !== null) {
    try {
      if (version === (await currentVersion())) return NextResponse.next();
    } catch (error) {
      console.error(error);
      return new NextResponse("Tidak bisa memeriksa sesi (database bermasalah).", { status: 503 });
    }
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
