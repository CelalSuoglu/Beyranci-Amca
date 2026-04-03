"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { brand } from "@/lib/brand";
import { navItems, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

/** Set `true` temporarily to log events + lime button on device. Default off. */
const NAV_DEBUG_HAMBURGER = false;

function scrollToHash(href: string) {
  const id = href.replace("#", "");
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const toggleMobileMenu = useCallback(() => {
    setOpen((v) => !v);
  }, []);

  const mobileNavPanel = (
    <div
      id="mobile-nav"
      data-navbar-mobile-panel
      className={cn(
        "fixed inset-x-0 bottom-0 top-[4.25rem] z-[55] transition-opacity duration-300 lg:hidden",
        "bg-[var(--background)]/96 backdrop-blur-lg",
        open
          ? "pointer-events-auto visible opacity-100"
          : "pointer-events-none invisible opacity-0",
      )}
      aria-hidden={!open}
      inert={!open ? true : undefined}
    >
      <nav
        className="flex h-full max-h-[100dvh] flex-col gap-1 overflow-y-auto overscroll-contain px-4 pb-8 pt-4"
        aria-label="Mobil menü"
      >
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="min-h-[48px] touch-manipulation rounded-xl px-4 py-3 text-base text-[var(--foreground)] transition-colors hover:bg-white/5 active:bg-white/[0.07]"
            onClick={(e) => {
              e.preventDefault();
              scrollToHash(item.href);
              setOpen(false);
            }}
          >
            {item.label}
          </a>
        ))}
        <div className="mt-4 border-t border-white/10 pt-4">
          {site.whatsapp ? (
            <Button
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
              onClick={() => setOpen(false)}
            >
              WhatsApp ile yazın
            </Button>
          ) : (
            <Button
              href="#contact"
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                scrollToHash("#contact");
                setOpen(false);
              }}
            >
              İletişim
            </Button>
          )}
        </div>
      </nav>
    </div>
  );

  const mobileHamburgerButton = (
    <button
      type="button"
      id="navbar-mobile-menu-trigger"
      data-navbar-hamburger
      className={cn(
        "fixed right-5 top-3 z-[100] inline-flex h-11 min-h-[44px] min-w-[44px] cursor-pointer touch-manipulation items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--foreground)] shadow-sm transition-colors [pointer-events:auto] sm:right-6",
        "hover:bg-white/[0.08] active:bg-white/[0.1] lg:hidden",
        NAV_DEBUG_HAMBURGER && "!z-[9999] !border-2 !border-black !bg-lime-400 !text-black",
      )}
      style={{ touchAction: "manipulation" }}
      aria-expanded={open}
      aria-controls="mobile-nav"
      aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        if (NAV_DEBUG_HAMBURGER) {
          console.log("[Navbar] mobile menu: onPointerDown", e.pointerType);
        }
        toggleMobileMenu();
      }}
      onTouchStart={() => {
        if (NAV_DEBUG_HAMBURGER) {
          console.log("[Navbar] mobile menu: onTouchStart");
        }
      }}
      onClick={(e) => {
        /** Keyboard activation uses detail === 0. Touch/mouse after pointerdown use detail >= 1 — skip to avoid double toggle. */
        if (e.detail === 0) {
          if (NAV_DEBUG_HAMBURGER) {
            console.log("[Navbar] mobile menu: onClick keyboard (detail 0)");
          }
          toggleMobileMenu();
          return;
        }
        if (!("PointerEvent" in window)) {
          if (NAV_DEBUG_HAMBURGER) {
            console.log("[Navbar] mobile menu: onClick fallback (no PointerEvent)");
          }
          toggleMobileMenu();
          return;
        }
        if (NAV_DEBUG_HAMBURGER) {
          console.log("[Navbar] mobile menu: onClick skipped (pointer path), detail=", e.detail);
        }
      }}
    >
      <span className="sr-only">Menü</span>
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden
      >
        {open ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M6 18L18 6M6 6l12 12"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 6h16M4 12h16M4 18h16"
          />
        )}
      </svg>
    </button>
  );

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[60] transition-[background,box-shadow,backdrop-filter] duration-300",
          scrolled
            ? "border-b border-white/5 bg-[var(--surface)]/88 shadow-lg shadow-black/25 backdrop-blur-md"
            : "bg-transparent",
        )}
      >
        <Container className="relative flex h-[4.25rem] items-center justify-between gap-4">
          <a
            href="#hero"
            className="group flex shrink-0 items-center gap-3 sm:gap-3.5"
            aria-label={`${site.name} — Ana sayfaya git`}
            onClick={(e) => {
              e.preventDefault();
              scrollToHash("#hero");
              setOpen(false);
            }}
          >
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1a0f0c] ring-2 ring-[#d4af37]/25 ring-offset-2 ring-offset-[var(--background)] transition group-hover:ring-[#d4af37]/45">
              <Image
                src="/beyranci-amca.png"
                alt={brand.logoAltNav}
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </span>
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--foreground)] sm:text-xl">
                {site.name}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
                {brand.slogan}
              </span>
            </span>
          </a>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Ana menü"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 text-sm text-[var(--foreground-muted)] transition-colors hover:text-[var(--accent)]"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToHash(item.href);
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {site.whatsapp ? (
              <Button
                href={site.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                className="!px-5 !py-2.5 text-xs"
              >
                WhatsApp
              </Button>
            ) : (
              <Button
                href="#contact"
                variant="primary"
                className="!px-5 !py-2.5 text-xs"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToHash("#contact");
                }}
              >
                İletişim
              </Button>
            )}
          </div>

          <div
            className="h-11 w-11 shrink-0 lg:hidden"
            aria-hidden
            data-navbar-hamburger-placeholder
          />
        </Container>
      </header>

      {mounted ? createPortal(mobileNavPanel, document.body) : null}
      {mounted ? createPortal(mobileHamburgerButton, document.body) : null}
    </>
  );
}
