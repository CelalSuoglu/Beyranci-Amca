import type { ReactNode } from "react";

export default function MutfakLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--background)]">
      {children}
    </div>
  );
}
