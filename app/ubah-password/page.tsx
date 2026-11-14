"use client";

import { useState } from "react";
import PasswordInput from "@/components/PasswordInput";

export default function UbahPasswordPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);
    if (next.length < 8) return setError("Kata sandi baru minimal 8 karakter.");
    if (next !== confirm) return setError("Konfirmasi tidak sama dengan kata sandi baru.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/ubah-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Gagal mengubah kata sandi.");
      setDone(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah kata sandi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm px-4 pt-24">
      <a href="/" className="mb-2 inline-block text-xs font-semibold text-indigo-600 hover:underline">
        ← Kembali
      </a>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Ubah Kata Sandi</h1>
      <p className="mb-6 text-sm text-gray-500">
        Kata sandi ini dipakai seluruh tim. Setelah diubah, orang lain harus masuk lagi dengan kata sandi baru.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <PasswordInput label="Kata sandi lama" value={current} onChange={setCurrent} autoComplete="current-password" autoFocus />
        <PasswordInput label="Kata sandi baru (min. 8 karakter)" value={next} onChange={setNext} autoComplete="new-password" />
        <PasswordInput label="Ulangi kata sandi baru" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {done && <p className="text-sm text-green-700">Kata sandi berhasil diubah.</p>}
        <button
          type="submit"
          disabled={submitting || !current || !next || !confirm}
          className="w-full rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
        </button>
      </form>
    </main>
  );
}
