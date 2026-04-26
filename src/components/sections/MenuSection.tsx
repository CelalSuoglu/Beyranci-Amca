import { cn } from "@/lib/utils";
import { section, card } from "@/lib/site-styles";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { menuCategories } from "@/lib/menu-data";

function CategoryHeading({ title }: { title: string }) {
  return (
    <div className="relative mb-8 sm:mb-10">
      <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[#faf6ef] sm:text-2xl">
        {title}
      </h3>
      <div
        className="mt-4 h-px w-full max-w-md bg-gradient-to-r from-[#d4af37]/65 via-[#d4af37]/22 to-transparent"
        aria-hidden
      />
    </div>
  );
}

function MenuCard({
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
        card.base,
        card.pad,
        "group border-white/[0.07] transition duration-300 hover:border-[#d4af37]/28",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <h4 className="min-w-0 flex-1 font-[family-name:var(--font-display)] text-lg font-semibold leading-snug text-[var(--foreground)] transition-colors group-hover:text-[#fde68a] sm:text-xl">
          {name}
        </h4>
        {price ? (
          <p className="shrink-0 font-semibold tabular-nums tracking-tight text-[#e8c76a] sm:pt-0.5 sm:text-right">
            {price}
          </p>
        ) : null}
      </div>
      {options?.length ? (
        <div className="mt-3 space-y-2">
          {options.map((option) => (
            <div
              key={option.name}
              className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-2 last:border-b-0 last:pb-0"
            >
              <span className="text-sm font-medium text-[#ebe4dc] sm:text-[0.9375rem]">
                {option.name}
              </span>
              <span className="shrink-0 whitespace-nowrap text-sm font-semibold tabular-nums text-[#d4af37]/95 sm:text-[0.9375rem]">
                {option.price}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      {descriptionList?.length ? (
        <div className="mt-4 border-t border-white/[0.06] pt-4">
          <ul className="grid grid-cols-1 gap-y-1.5 pl-5 text-sm leading-relaxed text-[var(--foreground-muted)] min-[430px]:grid-cols-2 min-[430px]:gap-x-6 sm:text-[0.9375rem]">
            {descriptionList.map((detail) => (
              <li key={detail} className="list-disc marker:text-[#d4af37]/85">
                {detail}
              </li>
            ))}
          </ul>
        </div>
      ) : description ? (
        <p className="mt-4 border-t border-white/[0.06] pt-4 text-sm leading-relaxed text-[var(--foreground-muted)] sm:text-[0.9375rem]">
          {description}
        </p>
      ) : null}
    </article>
  );
}

function MenuRow({ name, price }: { name: string; price: string }) {
  return (
    <div className="group relative flex min-h-[3rem] items-baseline justify-between gap-4 border-b border-white/[0.06] py-3.5 first:pt-0 last:border-0 last:pb-0 sm:gap-8">
      <div
        className="pointer-events-none absolute inset-x-0 -inset-y-px rounded-lg opacity-0 transition duration-300 group-hover:bg-white/[0.03] group-hover:opacity-100"
        aria-hidden
      />
      <span className="relative min-w-0 flex-1 text-[0.9375rem] font-medium leading-snug text-[#ebe4dc] transition-colors group-hover:text-[var(--foreground)] sm:text-base">
        {name}
      </span>
      <span className="relative shrink-0 font-semibold tabular-nums text-[#d4af37]/95">
        {price}
      </span>
    </div>
  );
}

export function MenuSection() {
  return (
    <section
      id="menu"
      aria-labelledby="menu-heading"
      className={cn(section.scroll, section.padY, section.divider, "bg-[var(--background)]")}
    >
      <Container>
        <SectionHeading titleId="menu-heading" title="Menü" />

        <div className="mx-auto mt-8 max-w-4xl space-y-12 sm:mt-10 sm:space-y-14 lg:space-y-16">
          {menuCategories.map((category) => (
            <div key={category.id}>
              <CategoryHeading title={category.title} />

              {category.layout === "cards" ? (
                <div className="space-y-6 sm:space-y-7">
                  <div className="grid gap-5 sm:gap-6">
                    {category.items.map((item) => (
                      <MenuCard
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
                        "rounded-2xl border border-white/[0.07] bg-[var(--surface)]/85 px-5 py-4 shadow-inner shadow-black/25 sm:px-8 sm:py-5",
                      )}
                    >
                      <h4 className="mb-3 font-[family-name:var(--font-display)] text-base font-semibold tracking-tight text-[#f5f0e8] sm:text-lg">
                        {category.subSectionTitle}
                      </h4>
                      {category.subSectionItems.map((item) => (
                        <MenuRow
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
                    "rounded-2xl border border-white/[0.07] bg-[var(--surface)]/85 px-5 py-2 shadow-inner shadow-black/25 sm:px-8 sm:py-3",
                  )}
                >
                  {category.id === "icecekler" ? (
                    <>
                      <div className="md:hidden">
                        {category.items.map((item) => (
                          <MenuRow
                            key={item.name}
                            name={item.name}
                            price={item.price}
                          />
                        ))}
                      </div>
                      <div className="hidden md:grid md:grid-cols-2 md:gap-x-12 md:divide-x md:divide-white/[0.06]">
                        <div className="md:pr-6">
                          {category.items
                            .slice(0, Math.ceil(category.items.length / 2))
                            .map((item) => (
                              <MenuRow
                                key={item.name}
                                name={item.name}
                                price={item.price}
                              />
                            ))}
                        </div>
                        <div className="md:border-t-0 md:pl-6">
                          {category.items
                            .slice(Math.ceil(category.items.length / 2))
                            .map((item) => (
                              <MenuRow
                                key={item.name}
                                name={item.name}
                                price={item.price}
                              />
                            ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="mx-auto max-w-2xl md:max-w-none">
                      {category.items.map((item) => (
                        <MenuRow
                          key={item.name}
                          name={item.name}
                          price={item.price}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
