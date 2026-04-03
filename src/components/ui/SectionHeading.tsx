import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  /** Başlık için benzersiz id — bölüm landmark ile ilişkilendirme */
  titleId?: string;
  /** `<header>` üzerinde ek sınıflar (ör. grid hücresi genişliği) */
  className?: string;
  /** Alt başlık `<p>` için ek sınıflar (genişlik, satır aralığı) */
  subtitleClassName?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  titleId,
  className,
  subtitleClassName,
}: Props) {
  const alignClass =
    align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl text-left";
  const subtitleAlign =
    align === "center" ? "mx-auto mt-5 max-w-2xl" : "mt-5 max-w-2xl";

  return (
    <header className={cn(alignClass, className)}>
      {eyebrow ? (
        <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[var(--gold-muted)] sm:text-xs sm:tracking-[0.35em]">
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={titleId}
        className="font-[family-name:var(--font-display)] text-[1.75rem] font-semibold leading-[1.15] tracking-tight text-[var(--foreground)] sm:text-4xl sm:leading-[1.12] md:text-[2.35rem]"
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            subtitleAlign,
            "text-[0.9375rem] leading-[1.65] text-[var(--foreground-muted)] sm:text-base",
            subtitleClassName,
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
