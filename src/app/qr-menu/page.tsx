import Image from "next/image";
import { menuCategories } from "@/lib/menu-data";
import { site } from "@/lib/site";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

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
  description,
}: {
  name: string;
  price: string;
  description?: string;
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
        <p className="shrink-0 whitespace-nowrap text-right text-[1.0625rem] font-semibold tabular-nums tracking-tight text-[#e8c76a] sm:min-w-[6rem] sm:text-lg">
          {price}
        </p>
      </header>
      {description ? (
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
                <div className="space-y-4 sm:space-y-5">
                  {category.items.map((item) => (
                    <QrMenuCard
                      key={item.name}
                      name={item.name}
                      price={item.price}
                      description={item.description}
                    />
                  ))}
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
