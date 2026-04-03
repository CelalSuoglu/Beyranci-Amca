import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { card } from "@/lib/site-styles";

type Props = {
  children: ReactNode;
  className?: string;
};

/** İletişim / menü kartları — tutarlı gölge ve hover */
export function SurfaceCard({ children, className }: Props) {
  return (
    <div className={cn(card.base, card.pad, className)}>{children}</div>
  );
}
