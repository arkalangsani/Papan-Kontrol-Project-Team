"use client";

import { useState } from "react";
import PasswordInput from "@/components/PasswordInput";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Gagal login.");
      // Reload penuh supaya cookie sesi terbaca oleh proxy.
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal login.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm px-4 pt-24">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">📋 Papan Kontrol Project Team</h1>
      <p className="mb-6 text-sm text-gray-500">Masukkan kata sandi tim untuk melanjutkan.</p>
      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <PasswordInput label="Kata sandi" value={password} onChange={setPassword} autoComplete="current-password" autoFocus />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !password}
          className="mt-4 w-full rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? "Memeriksa..." : "Masuk"}
        </button>
      </form>
    </main>
  );
}
