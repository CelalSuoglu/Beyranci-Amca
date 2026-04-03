import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    absolute: "Menü — QR | Beyrancı Amca",
  },
  description:
    "Beyrancı Amca — Çorbalar, pideler ve içecekler. QR menü.",
  robots: { index: false, follow: false },
};

export default function QrMenuLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
