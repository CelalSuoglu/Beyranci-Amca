import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
  id?: string;
};

export function Container({
  children,
  className = "",
  as: Tag = "div",
  id,
}: Props) {
  return (
    <Tag
      id={id}
      className={cn(
        "mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
