"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { MIN_ORDER_TOTAL_TL, PAYMENT_METHOD_LABELS } from "@/lib/orders/constants";
import { formatTry } from "@/lib/orders/format";
import {
  getOrderableCategories,
  type OrderableProduct,
} from "@/lib/orders/orderable-menu";
import {
  GARLIC_LEVELS,
  GARLIC_LEVEL_LABELS,
  SPICE_LEVEL_LABELS,
  defaultSpiceLevel,
  formatModifierLabels,
  type GarlicLevel,
  type SpiceLevel,
} from "@/lib/orders/spice";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

type CartLine = {
  key: string;
  productId: string;
  quantity: number;
  spiceLevel: SpiceLevel | null;
  garlicLevel: GarlicLevel | null;
};

type SuccessState = {
  orderNumber: string;
  total: number;
};

function cartKey(
  productId: string,
  spice: SpiceLevel | null,
  garlic: GarlicLevel | null,
) {
  return [productId, spice ?? "", garlic ?? ""].join("__");
}

export function SiparisPageClient() {
  const categories = useMemo(() => getOrderableCategories(), []);
  const productMap = useMemo(() => {
    const map = new Map<string, OrderableProduct>();
    for (const category of categories) {
      for (const product of category.products) {
        map.set(product.id, product);
      }
    }
    return map;
  }, [categories]);

  const [cart, setCart] = useState<CartLine[]>([]);
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [spicePick, setSpicePick] = useState<Record<string, SpiceLevel>>({});
  const [garlicPick, setGarlicPick] = useState<Record<string, GarlicLevel>>(
    {},
  );
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [pending, startTransition] = useTransition();

  const cartLines = useMemo(() => {
    return cart
      .map((line) => {
        const product = productMap.get(line.productId);
        if (!product || line.quantity < 1) return null;
        const modifierLabel = formatModifierLabels(
          line.spiceLevel,
          line.garlicLevel,
        );
        return {
          ...line,
          product,
          lineTotal: Math.round(product.unitPrice * line.quantity * 100) / 100,
          displayName: modifierLabel
            ? `${product.name} (${modifierLabel})`
            : product.name,
        };
      })
      .filter(Boolean) as {
      key: string;
      productId: string;
      quantity: number;
      spiceLevel: SpiceLevel | null;
      garlicLevel: GarlicLevel | null;
      product: OrderableProduct;
      lineTotal: number;
      displayName: string;
    }[];
  }, [cart, productMap]);

  const subtotal = useMemo(
    () =>
      Math.round(
        cartLines.reduce((sum, line) => sum + line.lineTotal, 0) * 100,
      ) / 100,
    [cartLines],
  );

  const meetsMinimum = subtotal >= MIN_ORDER_TOTAL_TL;
  const remaining = Math.max(0, MIN_ORDER_TOTAL_TL - subtotal);

  const cartItemCount = useMemo(
    () => cartLines.reduce((sum, line) => sum + line.quantity, 0),
    [cartLines],
  );

  function scrollToSection(id: string) {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function getQty(productId: string) {
    return qtys[productId] ?? 1;
  }

  function setProductQty(productId: string, next: number) {
    setQtys((prev) => ({
      ...prev,
      [productId]: Math.min(99, Math.max(1, next)),
    }));
  }

  function getSpice(product: OrderableProduct): SpiceLevel | null {
    if (!product.spiceLevels) return null;
    const picked = spicePick[product.id];
    if (picked && product.spiceLevels.includes(picked)) return picked;
    return defaultSpiceLevel(product.spiceLevels);
  }

  function getGarlic(product: OrderableProduct): GarlicLevel | null {
    if (!product.requiresGarlic) return null;
    return garlicPick[product.id] ?? "az_sarimsakli";
  }

  function addToCart(product: OrderableProduct) {
    const quantity = getQty(product.id);
    const spice = getSpice(product);
    const garlic = getGarlic(product);
    const key = cartKey(product.id, spice, garlic);

    setCart((prev) => {
      const existing = prev.find((line) => line.key === key);
      if (existing) {
        return prev.map((line) =>
          line.key === key
            ? {
                ...line,
                quantity: Math.min(99, line.quantity + quantity),
              }
            : line,
        );
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          quantity,
          spiceLevel: spice,
          garlicLevel: garlic,
        },
      ];
    });
    setError(null);
  }

  function updateCartQty(key: string, next: number) {
    setCart((prev) => {
      if (next < 1) return prev.filter((line) => line.key !== key);
      return prev.map((line) =>
        line.key === key
          ? { ...line, quantity: Math.min(99, next) }
          : line,
      );
    });
  }

  function submitOrder() {
    if (pending || success) return;
    setError(null);

    if (!meetsMinimum) {
      setError(
        `Minimum sipariş tutarı ${formatTry(MIN_ORDER_TOTAL_TL)}. Sepete en az ${formatTry(remaining)} daha ekleyin.`,
      );
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName,
            phone,
            address,
            note,
            paymentMethod,
            items: cartLines.map((line) => ({
              productId: line.product.id,
              quantity: line.quantity,
              ...(line.spiceLevel ? { spiceLevel: line.spiceLevel } : {}),
              ...(line.garlicLevel ? { garlicLevel: line.garlicLevel } : {}),
            })),
          }),
        });

        const data = (await res.json().catch(() => null)) as {
          error?: string;
          orderNumber?: string;
          total?: number;
        } | null;

        if (!res.ok || !data?.orderNumber) {
          setError(
            data?.error ??
              "Sipariş gönderilemedi. Lütfen bilgilerinizi kontrol edip tekrar deneyin.",
          );
          return;
        }

        setSuccess({
          orderNumber: data.orderNumber,
          total: data.total ?? subtotal,
        });
        setCart([]);
      } catch {
        setError(
          "Bağlantı kurulamadı. İnternetinizi kontrol edip tekrar deneyin.",
        );
      }
    });
  }

  if (success) {
    return (
      <Container className="py-16 sm:py-20">
        <div
          className="mx-auto max-w-lg rounded-2xl border border-[#d4af37]/35 bg-gradient-to-br from-[var(--surface)] to-[#14100e] p-8 text-center shadow-lg"
          role="status"
          aria-live="polite"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
            Sipariş alındı
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--foreground)]">
            Teşekkürler!
          </h1>
          <p className="mt-4 text-[var(--foreground-muted)]">
            Siparişiniz mutfağa iletildi. Sipariş numaranız:
          </p>
          <p className="mt-6 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-wide text-[#e8c76a]">
            {success.orderNumber}
          </p>
          <p className="mt-3 text-sm text-[var(--foreground-muted)]">
            Toplam: {formatTry(success.total)}
          </p>
          <p className="mt-5 text-base font-medium text-[#fde68a]">
            30 dakika teslimat süresi vardır.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button href="/" className="justify-center">
              Ana sayfa
            </Button>
            <Button
              type="button"
              variant="outline"
              className="justify-center"
              onClick={() => setSuccess(null)}
            >
              Yeni sipariş
            </Button>
          </div>
          {site.phoneTel ? (
            <p className="mt-6 text-sm text-[var(--foreground-muted)]">
              Sorunuz mu var?{" "}
              <a
                href={`tel:${site.phoneTel}`}
                className="font-medium text-[#fdba74] underline-offset-2 hover:underline"
              >
                {site.phoneDisplay}
              </a>
            </p>
          ) : null}
        </div>
      </Container>
    );
  }

  return (
    <Container
      className={cn(
        "pt-10 sm:pt-12",
        cartItemCount > 0 ? "pb-36 sm:pb-28" : "pb-28 sm:pb-16",
      )}
    >
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
          Paket sipariş
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Online sipariş
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--foreground-muted)]">
          Minimum sipariş tutarı{" "}
          <strong className="font-semibold text-[#e8c76a]">
            {formatTry(MIN_ORDER_TOTAL_TL)}
          </strong>
          . Lahmacun için acı, beyran için acı ve sarımsak, kebap için acı
          seçeneği seçin. Ödeme kapıda nakit veya kart ile alınır.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link
            href="/qr-menu"
            className="text-[#fdba74] underline-offset-2 hover:underline"
          >
            QR menüyü görüntüle
          </Link>
          {site.phoneTel ? (
            <a
              href={`tel:${site.phoneTel}`}
              className="text-[#fdba74] underline-offset-2 hover:underline"
            >
              Telefonla ara: {site.phoneDisplay}
            </a>
          ) : null}
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        <section aria-labelledby="menu-heading" className="space-y-10">
          <h2 id="menu-heading" className="sr-only">
            Menü
          </h2>

          <nav
            aria-label="Ürün kategorileri"
            className="sticky top-[4.25rem] z-30 -mx-5 border-b border-white/[0.06] bg-[var(--background)]/95 px-5 backdrop-blur-md sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-xl lg:border lg:border-white/[0.08] lg:px-3 lg:py-1"
          >
            <div
              className={cn(
                "flex gap-2 overflow-x-auto overscroll-x-contain py-3",
                "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
              )}
              role="tablist"
            >
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  className={cn(
                    "shrink-0 rounded-full border border-white/12 px-3.5 py-2 text-sm font-medium",
                    "min-h-10 text-[var(--foreground-muted)] transition-colors",
                    "hover:border-white/25 hover:text-[var(--foreground)]",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
                  )}
                  onClick={() => scrollToSection(`siparis-cat-${category.id}`)}
                >
                  {category.title}
                </button>
              ))}
            </div>
          </nav>

          {categories.map((category) => (
            <div
              key={category.id}
              id={`siparis-cat-${category.id}`}
              className="scroll-mt-[8.5rem] sm:scroll-mt-[8.75rem]"
            >
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#faf6ef]">
                {category.title}
              </h3>
              <div className="mt-4 space-y-3">
                {category.products.map((product) => {
                  const qty = getQty(product.id);
                  const spice = getSpice(product);
                  const garlic = getGarlic(product);
                  return (
                    <article
                      key={product.id}
                      className="rounded-xl border border-white/[0.08] bg-[var(--surface)]/80 p-4 sm:p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-[var(--foreground)]">
                            {product.name}
                          </h4>
                          {product.description ? (
                            <p className="mt-1.5 text-sm leading-relaxed text-[var(--foreground-muted)]">
                              {product.description}
                            </p>
                          ) : null}
                        </div>
                        <p className="shrink-0 font-semibold tabular-nums text-[#e8c76a]">
                          {formatTry(product.unitPrice)}
                        </p>
                      </div>

                      {product.spiceLevels ? (
                        <fieldset className="mt-4">
                          <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d4af37]/90">
                            Acı seçeneği
                          </legend>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {product.spiceLevels.map((level) => (
                              <label
                                key={level}
                                className={cn(
                                  "inline-flex min-h-10 cursor-pointer items-center rounded-full border px-3 text-sm font-medium transition-colors",
                                  spice === level
                                    ? "border-[#d4af37]/55 bg-[#d4af37]/15 text-[#fde68a]"
                                    : "border-white/12 text-[var(--foreground-muted)] hover:border-white/25",
                                )}
                              >
                                <input
                                  type="radio"
                                  name={`spice-${product.id}`}
                                  value={level}
                                  checked={spice === level}
                                  onChange={() =>
                                    setSpicePick((prev) => ({
                                      ...prev,
                                      [product.id]: level,
                                    }))
                                  }
                                  className="sr-only"
                                />
                                {SPICE_LEVEL_LABELS[level]}
                              </label>
                            ))}
                          </div>
                        </fieldset>
                      ) : null}

                      {product.requiresGarlic ? (
                        <fieldset className="mt-3">
                          <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d4af37]/90">
                            Sarımsak seçeneği
                          </legend>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {GARLIC_LEVELS.map((level) => (
                              <label
                                key={level}
                                className={cn(
                                  "inline-flex min-h-10 cursor-pointer items-center rounded-full border px-3 text-sm font-medium transition-colors",
                                  garlic === level
                                    ? "border-[#d4af37]/55 bg-[#d4af37]/15 text-[#fde68a]"
                                    : "border-white/12 text-[var(--foreground-muted)] hover:border-white/25",
                                )}
                              >
                                <input
                                  type="radio"
                                  name={`garlic-${product.id}`}
                                  value={level}
                                  checked={garlic === level}
                                  onChange={() =>
                                    setGarlicPick((prev) => ({
                                      ...prev,
                                      [product.id]: level,
                                    }))
                                  }
                                  className="sr-only"
                                />
                                {GARLIC_LEVEL_LABELS[level]}
                              </label>
                            ))}
                          </div>
                        </fieldset>
                      ) : null}

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div
                          className="inline-flex items-center rounded-full border border-white/15"
                          role="group"
                          aria-label={`${product.name} adet`}
                        >
                          <button
                            type="button"
                            className="flex h-11 w-11 items-center justify-center text-lg text-[var(--foreground)] hover:bg-white/5"
                            aria-label="Azalt"
                            onClick={() => setProductQty(product.id, qty - 1)}
                          >
                            −
                          </button>
                          <span
                            className="min-w-[2rem] text-center tabular-nums font-medium"
                            aria-live="polite"
                          >
                            {qty}
                          </span>
                          <button
                            type="button"
                            className="flex h-11 w-11 items-center justify-center text-lg text-[var(--foreground)] hover:bg-white/5"
                            aria-label="Artır"
                            onClick={() => setProductQty(product.id, qty + 1)}
                          >
                            +
                          </button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="!min-h-11 !rounded-full !px-4 text-sm"
                          onClick={() => addToCart(product)}
                        >
                          Sepete ekle
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        <aside
          id="siparis-musteri"
          className="scroll-mt-[5.5rem] lg:sticky lg:top-24"
        >
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[var(--surface)] to-[#14100e] p-5 shadow-lg sm:p-6">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
              Sepetiniz
            </h2>

            {cartLines.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--foreground-muted)]">
                Sepetiniz boş. Menüden ürün ekleyin.
              </p>
            ) : (
              <ul className="mt-4 space-y-3" aria-label="Sepet ürünleri">
                {cartLines.map((line) => (
                  <li
                    key={line.key}
                    className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-3 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--foreground)]">
                        {line.displayName}
                      </p>
                      <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                        {formatTry(line.product.unitPrice)} × {line.quantity}
                      </p>
                      <div className="mt-2 inline-flex items-center rounded-full border border-white/12">
                        <button
                          type="button"
                          className="flex h-9 w-9 items-center justify-center"
                          aria-label={`${line.displayName} adedini azalt`}
                          onClick={() =>
                            updateCartQty(line.key, line.quantity - 1)
                          }
                        >
                          −
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          className="flex h-9 w-9 items-center justify-center"
                          aria-label={`${line.displayName} adedini artır`}
                          onClick={() =>
                            updateCartQty(line.key, line.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <p className="shrink-0 font-semibold tabular-nums text-[#e8c76a]">
                      {formatTry(line.lineTotal)}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <dl className="mt-5 space-y-2 border-t border-white/[0.08] pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--foreground-muted)]">Ara toplam</dt>
                <dd className="font-medium tabular-nums">{formatTry(subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4 text-base">
                <dt className="font-semibold">Toplam</dt>
                <dd className="font-semibold tabular-nums text-[#e8c76a]">
                  {formatTry(subtotal)}
                </dd>
              </div>
            </dl>

            {!meetsMinimum && cartLines.length > 0 ? (
              <p
                className="mt-3 rounded-lg bg-[#7f1d1d]/35 px-3 py-2 text-sm text-[#fecaca]"
                role="status"
              >
                Minimum tutara {formatTry(remaining)} kaldı.
              </p>
            ) : null}

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                submitOrder();
              }}
              noValidate
            >
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium">
                  Ad soyad
                </label>
                <input
                  id="customerName"
                  name="customerName"
                  required
                  autoComplete="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium">
                  Telefon
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="05XX XXX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium">
                  Teslimat adresi
                </label>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows={3}
                  autoComplete="street-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={cn(fieldClass, "resize-y")}
                />
              </div>
              <div>
                <label htmlFor="note" className="block text-sm font-medium">
                  Sipariş notu{" "}
                  <span className="font-normal text-[var(--foreground-muted)]">
                    (isteğe bağlı)
                  </span>
                </label>
                <textarea
                  id="note"
                  name="note"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={cn(fieldClass, "resize-y")}
                />
              </div>
              <fieldset>
                <legend className="text-sm font-medium">Ödeme yöntemi</legend>
                <div className="mt-2 space-y-2">
                  {(["cash", "card"] as const).map((method) => (
                    <label
                      key={method}
                      className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-white/10 px-3 py-2 has-[:checked]:border-[#d4af37]/45 has-[:checked]:bg-white/[0.03]"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        className="h-4 w-4 accent-[var(--accent)]"
                      />
                      <span>{PAYMENT_METHOD_LABELS[method]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {error ? (
                <p
                  className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-[#fecaca]"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                className="w-full justify-center"
                disabled={pending || cartLines.length === 0 || !meetsMinimum}
                aria-busy={pending}
              >
                {pending ? "Sipariş gönderiliyor…" : "Siparişi onayla"}
              </Button>
            </form>
          </div>
        </aside>
      </div>

      {cartItemCount > 0 ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-6">
          <button
            type="button"
            className={cn(
              "pointer-events-auto mx-auto flex w-full max-w-lg items-center justify-between gap-3",
              "min-h-14 rounded-2xl border border-[#d4af37]/40 bg-[#1a120e]/95 px-4 py-3 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.65)] backdrop-blur-md",
              "text-left transition hover:border-[#d4af37]/55 hover:bg-[#221810]",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
            )}
            onClick={() => scrollToSection("siparis-musteri")}
            aria-label={`Sepette ${cartItemCount} ürün. Müşteri bilgilerine git.`}
          >
            <span className="flex min-w-0 items-center gap-3">
              <span
                className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full bg-[#d4af37]/2 px-2 text-sm font-semibold tabular-nums text-[#fde68a]"
                aria-live="polite"
              >
                {cartItemCount}
              </span>
              <span className="truncate text-sm font-medium text-[var(--foreground)] sm:text-base">
                Sepet · Bilgileri tamamla
              </span>
            </span>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-[#e8c76a]">
              {formatTry(subtotal)}
            </span>
          </button>
        </div>
      ) : null}
    </Container>
  );
}

const fieldClass = cn(
  "mt-1.5 w-full rounded-xl border border-white/12 bg-black/25 px-3 py-3 text-[var(--foreground)]",
  "placeholder:text-[var(--foreground-muted)]/70",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
);
