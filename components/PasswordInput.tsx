"use client";

import { useState } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  autoFocus?: boolean;
};

// Kolom sandi dengan tombol mata (tampilkan/sembunyikan).
export default function PasswordInput({ label, value, onChange, autoComplete, autoFocus }: Props) {
  const [show, setShow] = useState(false);
  const text = show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi";

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-gray-500">{label}</span>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={text}
          aria-pressed={show}
          title={text}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-gray-500 hover:text-indigo-600"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
            {show ? (
              <>
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                <path d="M9.9 5.1A9.8 9.8 0 0112 5c5 0 8.5 4 10 7a15.6 15.6 0 01-2.9 3.9M6.6 6.6A15.7 15.7 0 002 12c1.5 3 5 7 10 7a9.7 9.7 0 004.4-1" />
              </>
            ) : (
              <>
                <path d="M2 12c1.5-3 5-7 10-7s8.5 4 10 7c-1.5 3-5 7-10 7S3.5 15 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </>
            )}
          </svg>
        </button>
      </div>
    </label>
  );
}
