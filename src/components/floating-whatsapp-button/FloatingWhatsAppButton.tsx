import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";

const fabClass = cn(
  "pointer-events-auto flex h-[3.75rem] w-[3.75rem] min-h-[3.5rem] min-w-[3.5rem] items-center justify-center rounded-full",
  "bg-[#25D366] text-white ring-1 ring-white/20",
  "shadow-[0_12px_32px_-8px_rgba(0,0,0,0.55)]",
  "transition-transform duration-200 hover:scale-[1.06] active:scale-[0.97]",
  "motion-reduce:transition-none motion-reduce:hover:scale-100",
  "whatsapp-fab-pulse",
);

/**
 * Sabit WhatsApp — tüm sayfalarda; `site.whatsapp` doluysa gösterilir.
 */
export function FloatingWhatsAppButton() {
  if (!site.whatsapp) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed right-4 z-40 sm:right-6",
        "bottom-[max(1.35rem,calc(env(safe-area-inset-bottom,0px)+0.75rem))] sm:bottom-8",
      )}
    >
      <a
        href={site.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        title="Bize Ulaşın"
        aria-label="Bize Ulaşın — WhatsApp ile yazın"
        className={cn(fabClass, "pointer-events-auto")}
      >
        <WhatsAppIcon className="h-8 w-8 shrink-0" aria-hidden />
      </a>
    </div>
  );
}
