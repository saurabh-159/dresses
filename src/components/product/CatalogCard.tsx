"use client";

import Link from "next/link";
import { optimizedImageUrl } from "@/lib/images";

type CatalogCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    priceText: string;
    categoryName?: string;
    images: { url: string }[];
    videos?: { url: string }[];
  };
  className?: string;
};

export default function CatalogCard({ product, className = "" }: CatalogCardProps) {
  const image = product.images[0]?.url || "";
  const video = product.videos?.[0]?.url || "";

  async function shareProduct() {
    const url = `${window.location.origin}/product/${product.slug}`;
    const payload = { title: product.name, url };

    if (navigator.share) {
      try {
        await navigator.share(payload);
      } catch {
        // The share sheet was closed.
      }
      return;
    }

    await navigator.clipboard.writeText(url);
  }

  return (
    <article data-card className={`min-w-0 ${className}`}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-100 md:rounded-[22px]">
        <Link href={`/product/${product.slug}`} draggable={false} className="block h-full">
          {video && !image ? (
            <video
              src={video}
              muted
              loop
              playsInline
              autoPlay
              draggable={false}
              className="h-full w-full object-cover"
            />
          ) : image ? (
            <img
              src={optimizedImageUrl(image, 640)}
              alt={product.name}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm font-semibold text-stone-400">
              Photo coming soon
            </div>
          )}
        </Link>

        <div className="absolute top-2 right-2 flex flex-col gap-1.5 md:top-3 md:right-3 md:gap-2">
          <button
            type="button"
            aria-label={`Share ${product.name}`}
            onClick={() => shareProduct()}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-sm transition hover:text-wine md:h-9 md:w-9"
          >
            <ShareIcon />
          </button>
          <Link
            href={`/product/${product.slug}`}
            aria-label={`Open ${product.name}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-sm transition hover:text-wine md:h-9 md:w-9"
          >
            <OpenIcon />
          </Link>
        </div>

        <span className="pointer-events-none absolute bottom-2 left-2 max-w-[calc(100%-4.5rem)] truncate rounded-md bg-white px-1.5 py-1 text-[8px] font-bold tracking-wide text-stone-950 shadow-sm md:bottom-3 md:left-3 md:max-w-none md:px-2.5 md:py-1.5 md:text-[10px]">
          BUY 1 GET 1 FREE
        </span>
        {video && image ? (
          <span className="pointer-events-none absolute right-2 bottom-2 rounded-md bg-stone-950 px-1.5 py-1 text-[8px] font-bold tracking-wide text-white md:right-3 md:bottom-3 md:px-2.5 md:py-1.5 md:text-[10px]">
            Video
          </span>
        ) : null}
      </div>

      <div className="mt-2 min-w-0 md:mt-3">
        <div className="md:flex md:items-start md:justify-between md:gap-3">
          <h3 className="line-clamp-2 text-[13px] leading-snug font-medium text-stone-950 md:text-sm">
            <Link href={`/product/${product.slug}`}>{product.name}</Link>
          </h3>
          <p className="mt-1 text-sm font-bold text-stone-950 md:mt-0 md:shrink-0">{product.priceText}</p>
        </div>
        {product.categoryName ? (
          <p className="mt-1 truncate text-[10px] font-medium tracking-[0.12em] text-stone-400 uppercase md:text-[11px] md:tracking-[0.14em]">
            {product.categoryName}
          </p>
        ) : null}
      </div>

      <Link
        href={`/product/${product.slug}`}
        className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-md bg-blush px-2 py-1.5 text-[10px] font-bold tracking-wide text-stone-800 uppercase transition hover:bg-blush-dark md:mt-3 md:gap-2 md:px-3 md:py-2 md:text-[11px]"
      >
        Ready to ship
        <ArrowRight />
      </Link>
    </article>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="6" cy="12" r="2.2" />
      <circle cx="17" cy="7" r="2.2" />
      <circle cx="17" cy="17" r="2.2" />
      <path d="m8 11 7-3M8 13l7 3" strokeLinecap="round" />
    </svg>
  );
}

function OpenIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M8 4H5.5A1.5 1.5 0 0 0 4 5.5V18.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" strokeLinecap="round" />
      <path d="M13 4h7v7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 4 11 13" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
