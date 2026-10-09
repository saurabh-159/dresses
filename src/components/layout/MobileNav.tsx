"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import SearchField from "@/components/search/SearchField";
import { DEFAULT_QUOTE_MESSAGE, whatsappUrl } from "@/lib/whatsapp";

type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageUrl: string | null;
  children: CategoryNode[];
};

type SiteSettings = {
  siteName: string;
  logoUrl: string | null;
  whatsapp: string;
};

type MobileNavProps = {
  settings: SiteSettings;
  categories: CategoryNode[];
  pathname: string;
};

function itemClass(active: boolean) {
  return `flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-[15px] font-medium tracking-wide transition duration-200 ${
    active ? "bg-wine/10 text-wine" : "text-stone-800 hover:bg-paper"
  }`;
}

export default function MobileNav({ settings, categories, pathname }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const quoteUrl = settings.whatsapp
    ? whatsappUrl(settings.whatsapp, DEFAULT_QUOTE_MESSAGE)
    : "/contact";

  function closeMenu() {
    setOpen(false);
    setOpenSlug(null);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
    setOpenSlug(null);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setOpenSlug(null);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-stone-900 transition duration-200 hover:bg-stone-100"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M4 7h16" strokeLinecap="round" />
          <path d="M4 12h16" strokeLinecap="round" />
          <path d="M4 17h12" strokeLinecap="round" />
        </svg>
      </button>

      {mounted
        ? createPortal(
            <>
      <div
        className={`fixed inset-0 z-[60] bg-stone-800/25 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMenu}
        aria-hidden={!open}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-[70] flex w-[70vw] max-w-[70vw] transform flex-col bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <Link href="/" onClick={closeMenu} className="text-xl font-semibold tracking-tight text-stone-950">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.siteName} className="h-10 w-auto object-contain" />
            ) : (
              settings.siteName
            )}
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={closeMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-stone-700 transition duration-200 hover:bg-stone-100"
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M6 6l12 12" strokeLinecap="round" />
              <path d="M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <SearchField
            withIcon
            dropdown="inline"
            formClassName="mb-4"
            placeholder="Search clothes"
            onNavigate={closeMenu}
            inputClassName="h-12 w-full rounded-full border border-stone-200 bg-stone-50 pl-11 pr-4 text-sm outline-none transition duration-200 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:ring-4 focus:ring-stone-900/5"
          />

          <div className="flex flex-col gap-1">
            <Link href="/" onClick={closeMenu} className={itemClass(pathname === "/")} aria-current={pathname === "/" ? "page" : undefined}>
              Home
            </Link>
            <Link
              href="/shop"
              onClick={closeMenu}
              className={itemClass(pathname === "/shop" || pathname.startsWith("/shop/"))}
              aria-current={pathname === "/shop" || pathname.startsWith("/shop/") ? "page" : undefined}
            >
              Shop
            </Link>

            {categories.map((category) =>
              category.children.length > 0 ? (
                <div key={category.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSlug((current) => (current === category.slug ? null : category.slug))
                    }
                    className={itemClass(
                      pathname === `/category/${category.slug}` ||
                        category.children.some((child) => pathname === `/category/${child.slug}`)
                    )}
                    aria-expanded={openSlug === category.slug}
                  >
                    <span>{category.name}</span>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className={`transition-transform duration-300 ${openSlug === category.slug ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      openSlug === category.slug ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="ml-3 space-y-0.5 border-l border-stone-200 py-1 pl-3">
                        <Link
                          href={`/category/${category.slug}`}
                          onClick={closeMenu}
                          className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-900 transition duration-200 hover:bg-stone-50"
                        >
                          All {category.name}
                        </Link>
                        {category.children.map((child) => {
                          const active = pathname === `/category/${child.slug}`;
                          return (
                            <Link
                              key={child.id}
                              href={`/category/${child.slug}`}
                              onClick={closeMenu}
                              className={`block rounded-xl px-3 py-2.5 text-sm transition duration-200 ${
                                active
                                  ? "bg-stone-100 font-semibold text-stone-900"
                                  : "font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                              }`}
                            >
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  onClick={closeMenu}
                  className={itemClass(pathname === `/category/${category.slug}`)}
                  aria-current={pathname === `/category/${category.slug}` ? "page" : undefined}
                >
                  {category.name}
                </Link>
              )
            )}

            <Link
              href="/about"
              onClick={closeMenu}
              className={itemClass(pathname === "/about")}
              aria-current={pathname === "/about" ? "page" : undefined}
            >
              About
            </Link>
            <Link
              href="/contact"
              onClick={closeMenu}
              className={itemClass(pathname === "/contact")}
              aria-current={pathname === "/contact" ? "page" : undefined}
            >
              Contact
            </Link>
          </div>
        </div>

        <div className="border-t border-stone-100 p-4">
          <a
            href={quoteUrl}
            target={settings.whatsapp ? "_blank" : undefined}
            rel={settings.whatsapp ? "noreferrer" : undefined}
            onClick={closeMenu}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-blush text-sm font-semibold tracking-wide text-stone-800 transition duration-200 hover:bg-blush-dark active:scale-[0.99]"
          >
            {settings.whatsapp ? "Order on WhatsApp" : "Contact the store"}
          </a>
        </div>
      </aside>
            </>,
            document.body
          )
        : null}
    </div>
  );
}
