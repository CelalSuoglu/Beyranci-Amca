import Image from "next/image";
import { menuCategories } from "@/lib/menu-data";
import { site } from "@/lib/site";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

const qrDeals = [
  {
    id: "nohut-ayran",
    label: "FIRSAT",
    title: "Nohut Dürüm + Ayran",
    price: "150",
    currency: "TL",
    gradient: "from-[#3d1810] via-[#2a120e] to-[#1a0c08] ring-[#d4af37]/25",
    accent: "text-[#fde68a]",
    glow: "after:bg-[radial-gradient(circle_at_30%_0%,rgba(234,88,12,0.22),transparent_55%)]",
  },
  {
    id: "ciger-ayran",
    label: "FIRSAT",
    title: "Ciğer Dürüm + Ayran",
    price: "200",
    currency: "TL",
    gradient: "from-[#451a0a] via-[#2d120c] to-[#140804] ring-[#ea580c]/30",
    accent: "text-[#fdba74]",
    glow: "after:bg-[radial-gradient(circle_at_70%_0%,rgba(212,175,55,0.14),transparent_50%)]",
  },
] as const;

function QrCategoryTitle({
  title,
  id,
  isFirst,
}: {
  title: string;
  id: string;
  isFirst: boolean;
}) {
  return (
    <header
      className={cn(
        "mb-6 border-b border-white/[0.07] pb-5 sm:mb-7 sm:pb-6",
        isFirst ? "mt-8 sm:mt-10" : "mt-14 sm:mt-16",
      )}
    >
      <h2
        id={id}
        className="font-[family-name:var(--font-display)] text-[1.375rem] font-medium leading-tight tracking-[0.02em] text-[#faf6ef] sm:text-[1.625rem]"
      >
        {title}
      </h2>
      <div
        className="mt-4 h-px w-12 bg-gradient-to-r from-[#d4af37]/80 to-transparent sm:w-16"
        aria-hidden
      />
    </header>
  );
}

function QrMenuCard({
  name,
  price,
  options,
  description,
  descriptionList,
}: {
  name: string;
  price?: string;
  options?: { name: string; price: string }[];
  description?: string;
  descriptionList?: string[];
}) {
  return (
    <article
      className={cn(
        "rounded-xl border border-white/[0.07] bg-gradient-to-b from-[#1c1917]/95 to-[#141110]/98 px-5 py-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] sm:px-6 sm:py-6",
      )}
    >
      <header className="flex flex-row items-start justify-between gap-3 sm:gap-8">
        <h3 className="min-w-0 flex-1 text-left text-[1.0625rem] font-semibold leading-snug tracking-tight text-[#f5f0e8] sm:text-lg">
          {name}
        </h3>
        {price ? (
          <p className="shrink-0 whitespace-nowrap text-right text-[1.0625rem] font-semibold tabular-nums tracking-tight text-[#e8c76a] sm:min-w-[6rem] sm:text-lg">
            {price}
          </p>
        ) : null}
      </header>
      {options?.length ? (
        <div className="mt-3 space-y-2">
          {options.map((option) => (
            <div
              key={option.name}
              className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-2 last:border-b-0 last:pb-0"
            >
              <span className="text-[0.9375rem] font-medium leading-snug text-[#ebe4dc]">
                {option.name}
              </span>
              <span className="shrink-0 whitespace-nowrap text-right text-[0.9375rem] font-semibold tabular-nums tracking-tight text-[#d4af37]">
                {option.price}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      {descriptionList?.length ? (
        <div className="mt-4 border-t border-white/[0.06] pt-4">
          <ul className="grid grid-cols-1 gap-y-2 pl-5 text-[0.9375rem] leading-[1.65] text-[var(--foreground-muted)] min-[430px]:grid-cols-2 min-[430px]:gap-x-5">
            {descriptionList.map((detail) => (
              <li key={detail} className="list-disc marker:text-[#d4af37]/85">
                {detail}
              </li>
            ))}
          </ul>
        </div>
      ) : description ? (
        <p className="mt-4 border-t border-white/[0.06] pt-4 text-[0.9375rem] leading-[1.65] text-[var(--foreground-muted)]">
          {description}
        </p>
      ) : null}
    </article>
  );
}

function QrMenuRow({ name, price }: { name: string; price: string }) {
  return (
    <div className="flex min-h-[3.5rem] items-center justify-between gap-4 border-b border-white/[0.06] py-4 last:border-b-0 last:pb-0">
      <span className="min-w-0 flex-1 text-[1.0625rem] font-medium leading-snug tracking-tight text-[#ebe4dc]">
        {name}
      </span>
      <span className="shrink-0 min-w-[5.25rem] text-right text-[1.0625rem] font-semibold tabular-nums tracking-tight text-[#d4af37]">
        {price}
      </span>
    </div>
  );
}

export default function QrMenuPage() {
  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] antialiased">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(212,175,55,0.06),transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-md px-5 pb-14 pt-8 sm:px-6 sm:pb-16 sm:pt-10">
        <header className="border-b border-white/[0.08] pb-8 text-center">
          <p className="mb-5 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#d4af37]/75">
            Menü
          </p>
          <div className="mx-auto w-[5.25rem] sm:w-24">
            <Image
              src="/beyranci-amca.png"
              alt={brand.logoAltNav}
              width={96}
              height={96}
              className="h-auto w-full object-contain"
              priority
            />
          </div>
          <p className="mt-5 font-[family-name:var(--font-display)] text-[1.375rem] font-semibold leading-tight tracking-tight text-[#faf6ef] sm:text-2xl">
            {site.name}
          </p>
          <p className="mt-2 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--foreground-muted)]">
            Dijital menü
          </p>
        </header>

        <main className="mt-10 sm:mt-12">
          <section className="mb-14 sm:mb-16" aria-labelledby="qr-firsat-menusu">
            <QrCategoryTitle
              title="Fırsat Menüsü"
              id="qr-firsat-menusu"
              isFirst
            />
            <div className="grid gap-4 md:grid-cols-2 md:gap-5">
              {qrDeals.map((deal) => (
                <article
                  key={deal.id}
                  className={cn(
                    "group relative isolate overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br shadow-[0_12px_24px_-12px_rgba(0,0,0,0.6)] ring-1 ring-inset transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-12px_rgba(0,0,0,0.65)]",
                    deal.gradient,
                    deal.glow,
                    "after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:opacity-100",
                  )}
                >
                  <div className="relative z-10 flex flex-col items-center px-4 py-3.5 text-center sm:px-4.5 sm:py-4">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/20 shadow-inner sm:h-14 sm:w-14">
                      <Image
                        src="/beyranci-amca.png"
                        alt=""
                        fill
                        className="object-contain object-center p-1.5"
                        sizes="56px"
                      />
                    </div>
                    <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#c4a574]/80">
                      {deal.label}
                    </p>
                    <h3 className="mt-1 max-w-[13rem] font-[family-name:var(--font-display)] text-base font-semibold leading-snug tracking-tight text-[#faf6ef] transition group-hover:text-white sm:max-w-[14rem] sm:text-[1.05rem]">
                      {deal.title}
                    </h3>
                    <div
                      className="mt-2.5 flex w-full max-w-[13rem] flex-wrap items-end justify-center gap-x-1 gap-y-0.5 border-t border-white/12 pt-2.5"
                      aria-label={`Fiyat: ${deal.price} ${deal.currency}`}
                    >
                      <span
                        className={cn(
                          "font-[family-name:var(--font-display)] text-xl font-medium tabular-nums leading-none tracking-tight sm:text-2xl",
                          deal.accent,
                        )}
                      >
                        {deal.price}
                      </span>
                      <span className="pb-0.5 text-xs font-medium text-[#e8dcc8]/95 sm:text-sm">
                        {deal.currency}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {menuCategories.map((category, catIndex) => (
            <section
              key={category.id}
              className="mb-14 last:mb-0 sm:mb-16"
              aria-labelledby={`qr-cat-${category.id}`}
            >
              <QrCategoryTitle
                title={category.title}
                id={`qr-cat-${category.id}`}
                isFirst={catIndex === 0}
              />
              {category.layout === "cards" ? (
                <div className="space-y-5 sm:space-y-6">
                  <div className="space-y-4 sm:space-y-5">
                    {category.items.map((item) => (
                      <QrMenuCard
                        key={item.name}
                        name={item.name}
                        price={item.price}
                        options={item.options}
                        description={item.description}
                        descriptionList={item.descriptionList}
                      />
                    ))}
                  </div>
                  {category.subSectionTitle && category.subSectionItems?.length ? (
                    <div
                      className={cn(
                        "rounded-xl border border-white/[0.07] bg-gradient-to-b from-[#1c1917]/90 to-[#141110]/95 px-5 py-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] sm:px-6 sm:py-3",
                      )}
                    >
                      <h3 className="border-b border-white/[0.06] pb-3 pt-1 font-[family-name:var(--font-display)] text-[1rem] font-semibold tracking-tight text-[#f5f0e8] sm:text-[1.0625rem]">
                        {category.subSectionTitle}
                      </h3>
                      {category.subSectionItems.map((item) => (
                        <QrMenuRow
                          key={item.name}
                          name={item.name}
                          price={item.price}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div
                  className={cn(
                    "rounded-xl border border-white/[0.07] bg-gradient-to-b from-[#1c1917]/90 to-[#141110]/95 px-5 py-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] sm:px-6 sm:py-2",
                  )}
                >
                  {category.id === "icecekler" ? (
                    <>
                      <div className="md:hidden">
                        {category.items.map((item) => (
                          <QrMenuRow
                            key={item.name}
                            name={item.name}
                            price={item.price}
                          />
                        ))}
                      </div>
                      <div className="hidden md:grid md:grid-cols-2 md:gap-x-10 md:divide-x md:divide-white/[0.08]">
                        <div className="md:pr-5">
                          {category.items
                            .slice(0, Math.ceil(category.items.length / 2))
                            .map((item) => (
                              <QrMenuRow
                                key={item.name}
                                name={item.name}
                                price={item.price}
                              />
                            ))}
                        </div>
                        <div className="md:pl-5">
                          {category.items
                            .slice(Math.ceil(category.items.length / 2))
                            .map((item) => (
                              <QrMenuRow
                                key={item.name}
                                name={item.name}
                                price={item.price}
                              />
                            ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>
                      {category.items.map((item) => (
                        <QrMenuRow
                          key={item.name}
                          name={item.name}
                          price={item.price}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          ))}
        </main>

        <p className="mt-16 text-center font-[family-name:var(--font-display)] text-sm font-medium italic tracking-[0.12em] text-[#d4af37]/55 sm:mt-20">
          Afiyet olsun
        </p>
      </div>
    </div>
  );
}
