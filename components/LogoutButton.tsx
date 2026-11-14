"use client";

import { usePathname } from "next/navigation";

export default function LogoutButton() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="fixed right-4 top-3 z-10 flex gap-2 text-xs">
      <a
        href="/ubah-password"
        className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-gray-600 hover:border-indigo-500 hover:text-indigo-600"
      >
        Ubah sandi
      </a>
      <button
        type="button"
        onClick={logout}
        className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-gray-600 hover:border-red-500 hover:text-red-600"
      >
        Keluar
      </button>
    </div>
  );
}
