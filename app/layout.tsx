import type { Metadata, Viewport } from "next";
import "./globals.css";
import LogoutButton from "@/components/LogoutButton";

export const metadata: Metadata = {
  title: "Papan Kontrol Project Team",
  description: "Papan koordinasi tugas tim, semua orang lihat data yang sama secara real-time.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <LogoutButton />
        {children}
      </body>
    </html>
  );
}
