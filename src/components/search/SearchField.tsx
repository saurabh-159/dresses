"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { optimizedImageUrl } from "@/lib/images";
import {
  shouldSuggest,
  type SearchSuggestionCategory,
  type SearchSuggestionProduct,
  type SearchSuggestions,
} from "@/lib/search";

type SearchFieldProps = {
  placeholder: string;
  defaultValue?: string;
  inputClassName: string;
  formClassName?: string;
  autoFocus?: boolean;
  withIcon?: boolean;
  iconClassName?: string;
  submitLabel?: string;
  dropdown?: "overlay" | "inline";
  onNavigate?: () => void;
};

type SuggestionItem =
  | { key: string; kind: "category"; href: string; category: SearchSuggestionCategory }
  | { key: string; kind: "product"; href: string; product: SearchSuggestionProduct }
  | { key: string; kind: "all"; href: string; label: string };

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function Thumb({ src, alt }: { src: string | null; alt: string }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-stone-100 text-[11px] font-semibold uppercase text-stone-400">
      {src ? (
        <img src={optimizedImageUrl(src, 80)} alt="" className="h-full w-full object-cover" />
      ) : (
        alt.slice(0, 1)
      )}
    </span>
  );
}

export default function SearchField({
  placeholder,
  defaultValue = "",
  inputClassName,
  formClassName = "",
  autoFocus = false,
  withIcon = false,
  iconClassName = "left-4",
  submitLabel,
  dropdown = "overlay",
  onNavigate,
}: SearchFieldProps) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLFormElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestions>({
    query: "",
    categories: [],
    products: [],
  });
  const [activeIndex, setActiveIndex] = useState(-1);

  const ready = shouldSuggest(value);
  const matchesQuery = suggestions.query === value.trim();
  const visibleCategories = matchesQuery ? suggestions.categories : [];
  const visibleProducts = matchesQuery ? suggestions.products : [];
  const items: SuggestionItem[] = ready
    ? [
        ...visibleCategories.map((category) => ({
          key: `category-${category.id}`,
          kind: "category" as const,
          href: `/category/${category.slug}`,
          category,
        })),
        ...visibleProducts.map((product) => ({
          key: `product-${product.id}`,
          kind: "product" as const,
          href: `/product/${product.slug}`,
          product,
        })),
        {
          key: "all",
          kind: "all" as const,
          href: `/search?q=${encodeURIComponent(value.trim())}`,
          label: `Search all results for “${value.trim()}”`,
        },
      ]
    : [];

  const showPanel = open && ready;

  useEffect(() => {
    if (!ready) {
      setSuggestions({ query: "", categories: [], products: [] });
      setLoading(false);
      setError(false);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(false);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search/suggest?q=${encodeURIComponent(value.trim())}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Suggestion request failed");
        }
        const data = (await response.json()) as SearchSuggestions;
        if (controller.signal.aborted) return;
        setSuggestions(data);
        setActiveIndex(-1);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
        setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [ready, value]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function go(href: string) {
    setOpen(false);
    onNavigate?.();
    router.push(href);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!showPanel || items.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % items.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? items.length - 1 : current - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      go(items[activeIndex].href);
    }
  }

  const panelClass =
    dropdown === "inline"
      ? "mt-2 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_18px_50px_rgba(28,25,23,0.12)]"
      : "absolute left-0 right-0 top-[calc(100%+0.45rem)] z-40 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_18px_50px_rgba(28,25,23,0.12)]";

  return (
    <form
      ref={rootRef}
      action="/search"
      className={`relative z-30 ${formClassName}`}
      onSubmit={() => {
        setOpen(false);
        onNavigate?.();
      }}
    >
      {submitLabel ? (
        <div className="flex gap-2 sm:gap-3">
          <input
            name="q"
            type="search"
            value={value}
            placeholder={placeholder}
            aria-label="Search clothes"
            aria-autocomplete="list"
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-activedescendant={activeIndex >= 0 ? `${listId}-${items[activeIndex]?.key}` : undefined}
            autoFocus={autoFocus}
            autoComplete="off"
            onChange={(event) => {
              setValue(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className={inputClassName}
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-blush px-4 py-3 text-sm font-bold text-stone-800 sm:px-5 sm:text-base"
          >
            {submitLabel}
          </button>
        </div>
      ) : (
        <label className="relative block">
          {withIcon ? (
            <span className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-stone-400 ${iconClassName}`}>
              <SearchIcon />
            </span>
          ) : null}
          <input
            name="q"
            type="search"
            value={value}
            placeholder={placeholder}
            aria-label="Search clothes"
            aria-autocomplete="list"
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-activedescendant={activeIndex >= 0 ? `${listId}-${items[activeIndex]?.key}` : undefined}
            autoFocus={autoFocus}
            autoComplete="off"
            onChange={(event) => {
              setValue(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className={inputClassName}
          />
        </label>
      )}

      {showPanel ? (
        <div className={panelClass}>
          <div id={listId} role="listbox" aria-label="Search suggestions" className="max-h-80 overflow-y-auto p-1.5">
            {loading && !matchesQuery ? (
              <p className="px-3 py-3 text-sm text-stone-500">Looking for matches…</p>
            ) : null}

            {error ? (
              <p className="px-3 py-3 text-sm text-stone-500">Suggestions could not be loaded.</p>
            ) : null}

            {!error && visibleCategories.length > 0 ? (
              <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                Categories
              </div>
            ) : null}
            {visibleCategories.map((category) => {
              const index = items.findIndex((item) => item.key === `category-${category.id}`);
              const active = index === activeIndex;
              return (
                <Link
                  key={category.id}
                  id={`${listId}-category-${category.id}`}
                  href={`/category/${category.slug}`}
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className={`flex items-center gap-3 rounded-xl px-2.5 py-2 ${active ? "bg-stone-100" : "hover:bg-stone-50"}`}
                >
                  <Thumb src={category.imageUrl} alt={category.name} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-stone-900">{category.name}</span>
                    <span className="block truncate text-xs text-stone-500">
                      {category.parentName ? `${category.parentName} · Category` : "Category"}
                    </span>
                  </span>
                </Link>
              );
            })}

            {!error && visibleProducts.length > 0 ? (
              <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                Products
              </div>
            ) : null}
            {visibleProducts.map((product) => {
              const index = items.findIndex((item) => item.key === `product-${product.id}`);
              const active = index === activeIndex;
              return (
                <Link
                  key={product.id}
                  id={`${listId}-product-${product.id}`}
                  href={`/product/${product.slug}`}
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className={`flex items-center gap-3 rounded-xl px-2.5 py-2 ${active ? "bg-stone-100" : "hover:bg-stone-50"}`}
                >
                  <Thumb src={product.imageUrl} alt={product.name} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-stone-900">{product.name}</span>
                    <span className="block truncate text-xs text-stone-500">
                      {product.priceText ? `${product.priceText} · Product` : "Product"}
                    </span>
                  </span>
                </Link>
              );
            })}

            {!error && matchesQuery && visibleCategories.length === 0 && visibleProducts.length === 0 ? (
              <p className="px-3 py-3 text-sm text-stone-500">No matching category or product.</p>
            ) : null}

            <Link
              id={`${listId}-all`}
              href={`/search?q=${encodeURIComponent(value.trim())}`}
              role="option"
              aria-selected={activeIndex === items.length - 1}
              onMouseEnter={() => setActiveIndex(items.length - 1)}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className={`mt-1 block rounded-xl px-3 py-2.5 text-sm font-medium text-wine ${
                activeIndex === items.length - 1 ? "bg-stone-100" : "hover:bg-stone-50"
              }`}
            >
              Search all results for “{value.trim()}”
            </Link>
          </div>
        </div>
      ) : null}
    </form>
  );
}
