"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import MobileNav from "./MobileNav";
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

type HeaderProps = {
  settings: SiteSettings;
  categories: CategoryNode[];
};

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 6h16v12H4z" strokeLinejoin="round" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.5 3.5A11 11 0 0 0 2.1 17.2L1 23l5.9-1.1A11 11 0 0 0 12 23a11 11 0 0 0 8.5-19.5zM12 21a9 9 0 0 1-4.6-1.3l-.3-.2-3.4.6.6-3.3-.2-.3A9 9 0 1 1 12 21zm5-6.8c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.2-.7.9-.9 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.1 8.1 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.4.2-.4a.5.5 0 0 0 0-.4c-.1-.1-.6-1.5-.8-2s-.4-.5-.6-.5h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.4 11.4 0 0 0 4.4 3.9c.6.2 1 .4 1.4.5a3.4 3.4 0 0 0 1.6.1 2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.3c-.1-.2-.3-.2-.6-.4z" />
    </svg>
  );
}

function categoryIsActive(pathname: string, category: CategoryNode) {
  if (pathname === `/category/${category.slug}`) return true;
  return category.children.some((child) => pathname === `/category/${child.slug}`);
}

const linkClass = (active: boolean) =>
  `inline-flex h-9 shrink-0 items-center gap-1 border-b-2 px-3 text-[12px] font-semibold uppercase tracking-[0.16em] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine/30 focus-visible:ring-offset-2 ${
    active
      ? "border-gold text-wine"
      : "border-transparent text-stone-600 hover:border-gold/60 hover:text-wine"
  }`;

export default function Header({ settings, categories }: HeaderProps) {
  const pathname = usePathname();
  const [mobileSearch, setMobileSearch] = useState(false);

  const quoteUrl = settings.whatsapp
    ? whatsappUrl(settings.whatsapp, DEFAULT_QUOTE_MESSAGE)
    : "/contact";

  useEffect(() => {
    setMobileSearch(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileSearch) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileSearch(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileSearch]);

  return (
    <header
      className="border-b border-stone-200 bg-white"
    >
      <div className="container-aw flex h-14 items-center gap-3 lg:h-16">
        <Link
          href="/"
          className="group flex shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900/25"
          aria-label={`${settings.siteName} home`}
        >
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.siteName}
              className="h-9 w-auto max-w-[7.5rem] object-contain transition-opacity duration-200 group-hover:opacity-80 sm:h-11 sm:max-w-none"
            />
          ) : (
            <div className="min-w-0 transition-opacity duration-200 group-hover:opacity-75">
              <div className="max-w-[8.5rem] truncate text-xl font-semibold leading-none tracking-[-0.04em] text-stone-950 sm:max-w-none sm:text-[1.65rem]">
                {settings.siteName}
              </div>
              <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.28em] text-stone-400">
                Clothing
              </div>
            </div>
          )}
        </Link>

        <div className="hidden min-w-0 flex-1 px-6 lg:block">
          <SearchField
            withIcon
            iconClassName="left-4"
            formClassName="mx-auto w-full max-w-xl"
            placeholder="Search dresses, kurtis, sarees…"
            inputClassName="h-11 w-full rounded-full border border-stone-200 bg-stone-50 pl-11 pr-4 text-sm text-stone-900 outline-none transition duration-200 placeholder:text-stone-400 hover:border-stone-300 hover:bg-white focus:border-stone-900 focus:bg-white focus:ring-4 focus:ring-stone-900/5"
          />
        </div>

        <SearchField
          withIcon
          iconClassName="left-3.5"
          formClassName="hidden min-w-0 flex-1 sm:block lg:hidden"
          placeholder="Search"
          inputClassName="h-10 w-full rounded-full border border-stone-200 bg-stone-50 pl-10 pr-4 text-sm outline-none transition duration-200 placeholder:text-stone-400 hover:border-stone-300 focus:border-stone-900 focus:bg-white focus:ring-4 focus:ring-stone-900/5"
        />

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 lg:ml-0">
          <button
            type="button"
            onClick={() => setMobileSearch((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-stone-800 transition duration-200 hover:bg-stone-100 sm:hidden"
            aria-label={mobileSearch ? "Close search" : "Open search"}
            aria-expanded={mobileSearch}
          >
            <SearchIcon />
          </button>

          <a
            href={quoteUrl}
            target={settings.whatsapp ? "_blank" : undefined}
            rel={settings.whatsapp ? "noreferrer" : undefined}
            aria-label={settings.whatsapp ? "Chat on WhatsApp" : "Contact"}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-blush px-2.5 text-stone-800 shadow-sm transition duration-200 hover:bg-blush-dark sm:px-4"
          >
            {settings.whatsapp ? <WhatsAppIcon /> : <ContactIcon />}
            <span className="hidden text-[12px] font-semibold uppercase tracking-[0.14em] sm:inline">
              {settings.whatsapp ? "WhatsApp" : "Contact"}
            </span>
          </a>

          <MobileNav settings={settings} categories={categories} pathname={pathname} />
        </div>
      </div>

      {mobileSearch ? (
        <div className="border-t border-stone-100 px-4 py-3 sm:hidden">
          <SearchField
            withIcon
            autoFocus
            iconClassName="left-3.5"
            placeholder="Search dresses, kurtis, sarees…"
            onNavigate={() => setMobileSearch(false)}
            inputClassName="h-11 w-full rounded-full border border-stone-200 bg-stone-50 pl-10 pr-4 text-sm outline-none transition focus:border-stone-900 focus:bg-white focus:ring-4 focus:ring-stone-900/5"
          />
        </div>
      ) : null}

      <nav className="hidden border-t border-stone-100 lg:block" aria-label="Main navigation">
        <div className="container-aw flex flex-wrap items-center justify-center gap-1 py-1">
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className={linkClass(pathname === "/")}>
            Home
          </Link>
          <Link
            href="/shop"
            aria-current={pathname === "/shop" || pathname.startsWith("/shop/") ? "page" : undefined}
            className={linkClass(pathname === "/shop" || pathname.startsWith("/shop/"))}
          >
            Shop
          </Link>

          {categories.map((category) =>
            category.children.length > 0 ? (
              <div key={category.id} className="group relative">
                <Link
                  href={`/category/${category.slug}`}
                  aria-current={categoryIsActive(pathname, category) ? "page" : undefined}
                  className={linkClass(categoryIsActive(pathname, category))}
                >
                  {category.name}
                  <ChevronIcon className="transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
                </Link>

                <div className="pointer-events-none absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 translate-y-1 pt-3 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-1.5 shadow-[0_18px_50px_rgba(28,25,23,0.12)]">
                    <Link
                      href={`/category/${category.slug}`}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-900 transition duration-200 hover:bg-stone-50"
                    >
                      All {category.name}
                      <span aria-hidden="true" className="text-stone-400">
                        →
                      </span>
                    </Link>
                    <div className="my-1 h-px bg-stone-100" />
                    <div className="max-h-72 overflow-y-auto">
                      {category.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/category/${child.slug}`}
                          className="group/item flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-stone-600 transition duration-200 hover:bg-stone-50 hover:text-stone-900"
                        >
                          <span className="transition-transform duration-200 group-hover/item:translate-x-0.5">
                            {child.name}
                          </span>
                          <span
                            aria-hidden="true"
                            className="translate-x-1 text-stone-300 opacity-0 transition duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100"
                          >
                            →
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                aria-current={pathname === `/category/${category.slug}` ? "page" : undefined}
                className={linkClass(pathname === `/category/${category.slug}`)}
              >
                {category.name}
              </Link>
            )
          )}

          <Link
            href="/about"
            aria-current={pathname === "/about" ? "page" : undefined}
            className={linkClass(pathname === "/about")}
          >
            About
          </Link>
          <Link
            href="/contact"
            aria-current={pathname === "/contact" ? "page" : undefined}
            className={linkClass(pathname === "/contact")}
          >
            Contact
          </Link>
        </div>
      </nav>
    </header>
  );
}
