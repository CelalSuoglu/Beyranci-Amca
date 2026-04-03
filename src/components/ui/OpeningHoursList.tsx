import type { HoursRow } from "@/lib/site";
import { sitePlaceholders } from "@/lib/site";
import { cn } from "@/lib/utils";

type Props = {
  rows: readonly HoursRow[] | null | undefined;
  variant: "card" | "footer";
};

export function OpeningHoursList({ rows, variant }: Props) {
  if (!rows?.length) {
    return (
      <p
        className={cn(
          "leading-relaxed text-[var(--foreground-muted)]",
          variant === "card" && "mt-4 text-[15px]",
          variant === "footer" && "mt-1.5 block text-xs sm:text-sm",
        )}
      >
        {sitePlaceholders.hours}
      </p>
    );
  }

  return (
    <dl
      className={cn(variant === "card" && "mt-4", variant === "footer" && "mt-2")}
    >
      {rows.map((row) => (
        <div
          key={row.day}
          className={cn(
            "flex items-baseline justify-between gap-3 border-b border-white/[0.07] last:border-b-0",
            variant === "card" && "gap-4 py-2.5 sm:gap-8 sm:py-3",
            variant === "footer" && "gap-4 py-1.5 sm:py-2",
          )}
        >
          <dt
            className={cn(
              "min-w-0 text-[var(--foreground-muted)]",
              variant === "card" &&
                "text-[0.8125rem] leading-snug sm:text-[15px]",
              variant === "footer" && "text-xs leading-snug sm:text-sm",
            )}
          >
            {row.day}
          </dt>
          <dd
            className={cn(
              "shrink-0 tabular-nums tracking-tight text-[#e8e0d8]",
              variant === "card" &&
                "text-right text-[0.8125rem] font-medium sm:text-[15px]",
              variant === "footer" &&
                "text-right text-xs font-medium sm:text-sm",
            )}
          >
            {row.hours}
          </dd>
        </div>
      ))}
    </dl>
  );
}
