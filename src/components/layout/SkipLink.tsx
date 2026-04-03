/** Klavye ve ekran okuyucu kullanıcıları için ana içeriğe atlama */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-[var(--foreground)] px-4 py-2.5 text-sm font-semibold text-[var(--background)] shadow-lg transition focus:translate-y-0 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--ring)]"
    >
      Ana içeriğe geç
    </a>
  );
}
