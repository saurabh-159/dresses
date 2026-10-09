"use client";

import { useEffect, useState } from "react";
import { optimizedImageUrl } from "@/lib/images";

type ProductMedia = {
  fileId: string;
  url: string;
  filePath: string;
  sortOrder: number;
};

type GalleryItem = ProductMedia & {
  kind: "image" | "video";
};

type ProductGalleryProps = {
  productName: string;
  images: ProductMedia[];
  videos?: ProductMedia[];
};

export default function ProductGallery({
  productName,
  images,
  videos = [],
}: ProductGalleryProps) {
  const media: GalleryItem[] = [
    ...[...images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => ({ ...image, kind: "image" as const })),
    ...[...videos]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((video) => ({ ...video, kind: "video" as const })),
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const active = media[activeIndex] || null;

  useEffect(() => {
    if (!zoomed) {
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setZoomed(false);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed]);

  if (!active) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center rounded-2xl border border-stone-200 bg-stone-100 text-sm font-semibold text-stone-400">
        Photo coming soon
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {media.length > 1 ? (
          <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:w-[76px] sm:flex-col sm:overflow-visible">
            {media.map((item, index) => (
              <button
                key={`${item.kind}-${item.fileId}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border bg-white ${
                  index === activeIndex ? "border-stone-900" : "border-stone-200"
                }`}
                aria-label={item.kind === "video" ? `View video ${index + 1}` : `View image ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
              >
                {item.kind === "video" ? (
                  <video src={item.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                ) : (
                  <img
                    src={optimizedImageUrl(item.url, 160)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        ) : null}

        <div className="relative order-1 min-w-0 flex-1 overflow-hidden rounded-2xl bg-stone-100 sm:order-2">
          {active.kind === "video" ? (
            <video
              key={active.url}
              src={active.url}
              controls
              playsInline
              className="aspect-[3/4] h-full w-full bg-stone-950 object-contain"
            />
          ) : (
            <img
              src={optimizedImageUrl(active.url, 1200)}
              alt={productName}
              decoding="async"
              className="aspect-[3/4] w-full object-cover object-top"
            />
          )}

          {active.kind === "image" ? (
            <button
              type="button"
              onClick={() => setZoomed(true)}
              aria-label="Zoom image"
              className="absolute top-1/3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-800 shadow-sm"
            >
              <ZoomIcon />
            </button>
          ) : null}

          {media.length > 1 ? (
            <span className="absolute right-3 bottom-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white">
              {activeIndex + 1}/{media.length}
            </span>
          ) : null}
        </div>
      </div>

      {zoomed && active.kind === "image" ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoomed(false)}
        >
          <button
            type="button"
            aria-label="Close zoom"
            className="absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-900"
          >
            ×
          </button>
          <img
            src={optimizedImageUrl(active.url, 1600)}
            alt={productName}
            className="max-h-[90vh] max-w-full object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}

function ZoomIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4M11 8.5v5M8.5 11h5" strokeLinecap="round" />
    </svg>
  );
}
