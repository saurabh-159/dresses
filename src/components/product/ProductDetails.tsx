"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import ProductCard from "@/components/product/ProductCard";
import { optimizedImageUrl } from "@/lib/images";
import { whatsappUrl } from "@/lib/whatsapp";

type Media = {
  fileId: string;
  url: string;
  filePath: string;
  sortOrder: number;
};

type VariantOption = {
  attributeId: string;
  name: string;
  slug: string;
  type: "select" | "color" | "text";
  value: string;
};

type ProductVariant = {
  options: VariantOption[];
  priceText: string;
};

type RelatedProduct = {
  id: string;
  name: string;
  slug: string;
  priceText: string;
  minQty: number;
  images: { url: string }[];
  videos?: { url: string }[];
};

type ProductDetailsProps = {
  product: {
    name: string;
    slug: string;
    sku: string;
    priceText: string;
    description: string;
    sizes: string;
    fabric: string;
    color: string;
    minQty: number;
    images: Media[];
    videos: Media[];
    variants: ProductVariant[];
  };
  category: {
    name: string;
    slug: string;
    parent: { name: string; slug: string } | null;
  } | null;
  related: RelatedProduct[];
  whatsapp: string;
  storeName: string;
};

type GalleryItem = Media & { kind: "image" | "video" };

const SIZE_GUIDE = [
  { size: "XS", bust: '32" / 81 cm', waist: '26" / 66 cm', hip: '35" / 89 cm' },
  { size: "S", bust: '34" / 86 cm', waist: '28" / 71 cm', hip: '37" / 94 cm' },
  { size: "M", bust: '36" / 91 cm', waist: '30" / 76 cm', hip: '39" / 99 cm' },
  { size: "L", bust: '38" / 97 cm', waist: '32" / 81 cm', hip: '41" / 104 cm' },
  { size: "XL", bust: '40" / 102 cm', waist: '34" / 86 cm', hip: '43" / 109 cm' },
];

const MEASURE_STEPS = [
  { label: "Bust", text: "Around the fullest part of the chest, tape level with the floor." },
  { label: "Waist", text: "Around the natural waist, where the body narrows." },
  { label: "Hip", text: "Around the fullest part of the hips, about 8 inches below the waist." },
];

const COLOR_CLASS: Record<string, string> = {
  black: "bg-neutral-950",
  white: "bg-white ring-1 ring-black/15",
  red: "bg-red-700",
  pink: "bg-pink-400",
  orange: "bg-orange-500",
  purple: "bg-purple-800",
  blue: "bg-blue-800",
  navy: "bg-blue-950",
  green: "bg-emerald-700",
  beige: "bg-[#e6d3b3]",
  gold: "bg-amber-400",
  maroon: "bg-red-900",
  yellow: "bg-yellow-300",
  cream: "bg-[#f3e6d0]",
  grey: "bg-neutral-400",
  gray: "bg-neutral-400",
  brown: "bg-amber-900",
  olive: "bg-[#4d5c2e]",
  ivory: "bg-[#f7f1e8]",
};

const LIGHT_COLORS = new Set(["white", "beige", "gold", "yellow", "cream", "ivory", "pink"]);

function colorClass(name: string) {
  const key = name.trim().toLowerCase();
  if (COLOR_CLASS[key]) {
    return COLOR_CLASS[key];
  }

  const match = Object.keys(COLOR_CLASS).find((color) => key.includes(color));
  return match ? COLOR_CLASS[match] : "bg-neutral-300";
}

function isColorOption(option: { name: string; slug: string; type: string }) {
  return option.type === "color" || /colou?r/i.test(option.slug) || /colou?r/i.test(option.name);
}

function isSizeOption(option: { name: string; slug: string }) {
  return option.slug === "size" || /size/i.test(option.name);
}

function selectionOf(row?: ProductVariant | null) {
  const selected: Record<string, string> = {};

  for (const option of row?.options || []) {
    selected[option.attributeId] = option.value;
  }

  return selected;
}

function matchVariant(variants: ProductVariant[], selected: Record<string, string>) {
  return (
    variants.find((row) =>
      row.options.every((option) => selected[option.attributeId] === option.value)
    ) || null
  );
}

function chooseVariant(
  variants: ProductVariant[],
  selected: Record<string, string>,
  attributeId: string,
  value: string
) {
  const exact = matchVariant(variants, { ...selected, [attributeId]: value });

  if (exact) {
    return exact;
  }

  return (
    variants.find((row) =>
      row.options.some((option) => option.attributeId === attributeId && option.value === value)
    ) ||
    variants[0] ||
    null
  );
}

function groupsFromVariants(variants: ProductVariant[]) {
  const groups: {
    id: string;
    name: string;
    slug: string;
    type: VariantOption["type"];
    values: string[];
  }[] = [];

  for (const variant of variants) {
    for (const option of variant.options) {
      let group = groups.find((item) => item.id === option.attributeId);

      if (!group) {
        group = {
          id: option.attributeId,
          name: option.name,
          slug: option.slug,
          type: option.type,
          values: [],
        };
        groups.push(group);
      }

      if (!group.values.includes(option.value)) {
        group.values.push(option.value);
      }
    }
  }

  const rank = (group: (typeof groups)[number]) => {
    if (isColorOption(group)) {
      return 0;
    }

    if (isSizeOption(group)) {
      return 1;
    }

    return 2;
  };

  return groups.sort((a, b) => rank(a) - rank(b));
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ProductDetails({
  product,
  category,
  related,
  whatsapp,
  storeName,
}: ProductDetailsProps) {
  const gallery = useMemo<GalleryItem[]>(() => {
    const images = [...product.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => ({ ...image, kind: "image" as const }));
    const videos = [...product.videos]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((video) => ({ ...video, kind: "video" as const }));

    return [...images, ...videos];
  }, [product.images, product.videos]);

  const groups = useMemo(() => groupsFromVariants(product.variants), [product.variants]);
  const sizeChoices = splitList(product.sizes);
  const colourChoices = splitList(product.color);
  const [activeImage, setActiveImage] = useState(0);
  const [picked, setPicked] = useState<Record<string, string> | null>(null);
  const [fallbackSize, setFallbackSize] = useState(sizeChoices[0] || "");
  const [fallbackColour, setFallbackColour] = useState(colourChoices[0] || product.color);
  const [quantity, setQuantity] = useState(Math.max(1, product.minQty || 1));
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [copied, setCopied] = useState(false);

  const selection = picked || selectionOf(product.variants[0]);
  const active = matchVariant(product.variants, selection) || product.variants[0] || null;
  const shownPrice = active?.priceText || product.priceText;
  const sizeGroup = groups.find((group) => isSizeOption(group));
  const shownSize = sizeGroup ? selection[sizeGroup.id] : fallbackSize;

  const lineOptions = groups.length
    ? active?.options || []
    : [
        ...(fallbackColour ? [{ name: "Colour", value: fallbackColour }] : []),
        ...(fallbackSize ? [{ name: "Size", value: fallbackSize }] : []),
      ];

  const chosen = [
    ...lineOptions.map((option) => `${option.name}: ${option.value}`),
    product.fabric ? `Fabric: ${product.fabric}` : "",
    quantity > 1 ? `Qty: ${quantity}` : "",
  ].filter(Boolean);

  const message = [
    `Hi, I want to order ${product.name}.`,
    chosen.length ? `${chosen.join(", ")}.` : "",
    shownPrice ? `Price: ${shownPrice}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const quoteUrl = whatsapp ? whatsappUrl(whatsapp, message) : "/contact";
  const activeMedia = gallery[activeImage] || null;

  useEffect(() => {
    if (!sizeGuideOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSizeGuideOpen(false);
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [sizeGuideOpen]);

  function selectOption(attributeId: string, value: string) {
    const row = chooseVariant(product.variants, selection, attributeId, value);

    if (row) {
      setPicked(selectionOf(row));
    }
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const highlights = [
    product.fabric ? `Fabric · ${product.fabric}` : "",
    ...lineOptions.map((option) => `${option.name} · ${option.value}`),
    shownPrice ? `Price · ${shownPrice}` : "",
    "Message on WhatsApp with your size and colour to place the order.",
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 pb-28 sm:px-6 md:py-8 lg:px-8 lg:pb-8">
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-neutral-500 md:text-sm">
        <Link href="/" className="hover:text-neutral-950">
          Home
        </Link>
        <span className="text-neutral-300">/</span>
        <Link href="/shop" className="hover:text-neutral-950">
          Shop
        </Link>
        {category?.parent ? (
          <>
            <span className="text-neutral-300">/</span>
            <Link href={`/category/${category.parent.slug}`} className="hover:text-neutral-950">
              {category.parent.name}
            </Link>
          </>
        ) : null}
        {category ? (
          <>
            <span className="text-neutral-300">/</span>
            <Link href={`/category/${category.slug}`} className="hover:text-neutral-950">
              {category.name}
            </Link>
          </>
        ) : null}
        <span className="text-neutral-300">/</span>
        <span className="max-w-[220px] truncate font-semibold text-neutral-950">{product.name}</span>
      </nav>

      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-12">
        <div className="flex w-full flex-col-reverse gap-3 lg:sticky lg:top-[var(--site-header-offset,5rem)] lg:flex-row lg:items-stretch lg:gap-4 lg:self-start">
          {gallery.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-1 lg:w-20 lg:shrink-0 lg:flex-col lg:justify-start lg:gap-3 lg:overflow-visible lg:pb-0">
              {gallery.map((item, index) => (
                <button
                  key={`${item.kind}-${item.fileId}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={item.kind === "video" ? `View video ${index + 1}` : `View image ${index + 1}`}
                  className={`relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-lg bg-[#f3ebe3] transition duration-300 sm:w-16 lg:w-full ${
                    activeImage === index
                      ? "ring-2 ring-neutral-900 ring-offset-1"
                      : "opacity-70 ring-1 ring-black/10 hover:opacity-100"
                  }`}
                >
                  {item.kind === "video" ? (
                    <video src={item.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                  ) : (
                    <img
                      src={optimizedImageUrl(item.url, 160)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          ) : null}

          <div className="relative min-h-[min(62vh,520px)] min-w-0 flex-1 overflow-hidden rounded-xl bg-[#f3ebe3] ring-1 ring-black/5 lg:min-h-[min(78vh,720px)]">
            {activeMedia?.kind === "video" ? (
              <video
                key={activeMedia.url}
                src={activeMedia.url}
                controls
                playsInline
                className="absolute inset-0 h-full w-full bg-neutral-950 object-contain"
              />
            ) : activeMedia ? (
              <img
                src={optimizedImageUrl(activeMedia.url, 720, { height: 960, fit: "max" })}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-contain object-center"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-neutral-400">
                Photo coming soon
              </div>
            )}

            <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 sm:top-4 sm:right-4">
              <button
                type="button"
                onClick={copyShareLink}
                aria-label="Share product"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-md backdrop-blur-md transition hover:scale-105 active:scale-95"
              >
                {copied ? <CheckIcon className="h-4 w-4 text-green-600" /> : <ShareIcon />}
              </button>
            </div>

            {gallery.length > 0 ? (
              <div className="absolute right-3 bottom-3 z-10 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm sm:right-4 sm:bottom-4">
                {activeImage + 1} / {gallery.length}
              </div>
            ) : null}
          </div>
        </div>

        <div className="lg:pt-1">
          <p className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] text-emerald-700 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            In stock
          </p>

          <h1 className="text-[1.45rem] leading-[1.15] font-medium tracking-tight text-balance text-neutral-950 sm:text-[1.65rem] md:text-[2.15rem]">
            {product.name}
          </h1>

          <div className="mt-6 border-y border-neutral-200/80 py-5">
            <p className="text-2xl font-medium tracking-tight text-neutral-950 sm:text-3xl md:text-[2.35rem]">
              {shownPrice}
            </p>
          </div>

          {product.sku ? (
            <p className="mt-3 text-xs tracking-wide text-neutral-500">
              SKU <span className="font-medium text-neutral-900">{product.sku}</span>
            </p>
          ) : null}

          {product.description ? (
            <p className="mt-5 text-[15px] leading-relaxed text-neutral-600">{product.description}</p>
          ) : null}

          {product.fabric ? (
            <p className="mt-3 text-sm text-neutral-500">Fabric · {product.fabric}</p>
          ) : null}

          {groups.map((group) => {
            const selected = selection[group.id];
            const color = isColorOption(group);
            const size = isSizeOption(group);

            return (
              <div key={group.id} className="mt-8">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-neutral-500 uppercase">
                    {group.name} — <span className="text-neutral-900">{selected}</span>
                  </p>
                  {size ? (
                    <button
                      type="button"
                      onClick={() => setSizeGuideOpen(true)}
                      className="text-xs font-medium text-neutral-700 underline decoration-neutral-400 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-950"
                    >
                      Size guide
                    </button>
                  ) : null}
                </div>
                <div className={`flex flex-wrap ${color ? "gap-3" : "gap-2"}`}>
                  {group.values.map((value) =>
                    color ? (
                      <button
                        key={value}
                        type="button"
                        onClick={() => selectOption(group.id, value)}
                        aria-label={value}
                        title={value}
                        className={`relative h-9 w-9 rounded-full transition ${colorClass(value)} ${
                          selected === value
                            ? "ring-2 ring-neutral-950 ring-offset-2"
                            : "ring-1 ring-black/10 hover:ring-black/25"
                        }`}
                      >
                        {selected === value ? (
                          <CheckIcon
                            className={`absolute inset-0 m-auto h-3.5 w-3.5 ${
                              LIGHT_COLORS.has(value.toLowerCase()) ? "text-neutral-900" : "text-white"
                            }`}
                          />
                        ) : null}
                      </button>
                    ) : (
                      <button
                        key={value}
                        type="button"
                        onClick={() => selectOption(group.id, value)}
                        className={`h-11 min-w-[3.15rem] px-3.5 text-sm font-medium transition ${
                          selected === value
                            ? "bg-neutral-950 text-white"
                            : "bg-[#f6f1ea] text-neutral-800 ring-1 ring-black/5 hover:bg-neutral-200/70"
                        }`}
                      >
                        {value}
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}

          {groups.length === 0 && (colourChoices.length > 0 || product.color) ? (
            <div className="mt-8">
              <p className="mb-3 text-[11px] font-semibold tracking-[0.2em] text-neutral-500 uppercase">
                Colour — <span className="text-neutral-900">{fallbackColour}</span>
              </p>
              <div className="flex flex-wrap gap-3">
                {(colourChoices.length ? colourChoices : [product.color]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFallbackColour(value)}
                    aria-label={value}
                    title={value}
                    className={`relative h-9 w-9 rounded-full transition ${colorClass(value)} ${
                      fallbackColour === value
                        ? "ring-2 ring-neutral-950 ring-offset-2"
                        : "ring-1 ring-black/10 hover:ring-black/25"
                    }`}
                  >
                    {fallbackColour === value ? (
                      <CheckIcon
                        className={`absolute inset-0 m-auto h-3.5 w-3.5 ${
                          LIGHT_COLORS.has(value.toLowerCase()) ? "text-neutral-900" : "text-white"
                        }`}
                      />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {groups.length === 0 && sizeChoices.length > 0 ? (
            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-neutral-500 uppercase">
                  Size — <span className="text-neutral-900">{fallbackSize}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs font-medium text-neutral-700 underline decoration-neutral-400 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-950"
                >
                  Size guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizeChoices.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFallbackSize(size)}
                    className={`h-11 min-w-[3.15rem] px-3.5 text-sm font-medium transition ${
                      fallbackSize === size
                        ? "bg-neutral-950 text-white"
                        : "bg-[#f6f1ea] text-neutral-800 ring-1 ring-black/5 hover:bg-neutral-200/70"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-7 flex items-center gap-3 border-l-2 border-neutral-950/80 bg-[#f6f1ea] px-4 py-3">
            <FlameIcon />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-neutral-900">Selling fast</span>
                <span className="text-xs font-medium text-neutral-600">Message to reserve</span>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden bg-neutral-300/60">
                <div className="h-full w-[72%] bg-neutral-950" />
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <div className="flex h-12 items-center bg-[#f6f1ea] ring-1 ring-black/5">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(product.minQty || 1, current - 1))}
                className="flex h-full w-11 items-center justify-center text-neutral-600 transition hover:bg-black/5"
                aria-label="Decrease quantity"
              >
                <MinusIcon />
              </button>
              <span className="w-10 text-center text-sm font-medium text-neutral-950 tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((current) => current + 1)}
                className="flex h-full w-11 items-center justify-center text-neutral-600 transition hover:bg-black/5"
                aria-label="Increase quantity"
              >
                <PlusIcon />
              </button>
            </div>
            <a
              href={quoteUrl}
              target={whatsapp ? "_blank" : undefined}
              rel={whatsapp ? "noreferrer" : undefined}
              className="flex h-12 flex-1 items-center justify-center bg-blush px-4 text-sm font-medium tracking-wide transition hover:bg-blush-dark"
              style={{ color: "var(--theme-text)" }}
            >
              {whatsapp ? "Order on WhatsApp" : "Contact the store"}
            </a>
          </div>

          <a
            href={quoteUrl}
            target={whatsapp ? "_blank" : undefined}
            rel={whatsapp ? "noreferrer" : undefined}
            className="mt-3 flex h-12 w-full items-center justify-center border border-stone-200 bg-white text-sm font-medium tracking-wide transition hover:bg-blush"
            style={{ color: "var(--theme-text)" }}
          >
            {whatsapp ? "Buy now — message us" : "Ask about this piece"}
          </a>

          <ul className="mt-8 grid grid-cols-2 gap-px overflow-hidden bg-neutral-200/80 sm:grid-cols-3 [&>li:last-child]:col-span-2 sm:[&>li:last-child]:col-span-1">
            {[
              { icon: TruckIcon, title: "WhatsApp order", sub: "Send size and colour" },
              { icon: RefreshIcon, title: "Size help", sub: "We confirm the fit" },
              { icon: ShieldIcon, title: storeName, sub: "Ready-to-wear pieces" },
            ].map((item) => (
              <li key={item.title} className="flex items-start gap-3 bg-white px-4 py-4">
                <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-800" />
                <div>
                  <p className="text-sm font-medium text-neutral-950">{item.title}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">{item.sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="mt-16 md:mt-20">
        <div className="flex gap-1 overflow-x-auto border-b border-neutral-200 pb-px">
          {[
            { id: "description", label: "Description" },
            { id: "specs", label: "Specifications" },
            { id: "reviews", label: "Reviews" },
            { id: "shipping", label: "Shipping & Returns" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative shrink-0 px-4 py-3.5 text-sm whitespace-nowrap transition md:px-5 ${
                activeTab === tab.id ? "font-medium text-neutral-950" : "text-neutral-400 hover:text-neutral-700"
              }`}
            >
              {tab.label}
              {activeTab === tab.id ? (
                <span className="absolute inset-x-4 bottom-0 h-0.5 bg-neutral-950 md:inset-x-5" />
              ) : null}
            </button>
          ))}
        </div>

        <div className="py-8 md:py-10">
          {activeTab === "description" ? (
            <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.22em] text-neutral-400 uppercase">
                  About this piece
                </p>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-neutral-600 md:text-base">
                  {product.description || `${product.name} from ${storeName}.`}
                </p>
                {product.fabric ? (
                  <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-500">
                    Fabric: {product.fabric}. Pair it as it is, or message us if you want help with the fit.
                  </p>
                ) : null}
              </div>
              <div className="bg-[#f6f1ea] p-6 md:p-7">
                <p className="text-[11px] font-semibold tracking-[0.22em] text-neutral-500 uppercase">
                  Key highlights
                </p>
                <ul className="mt-5 space-y-3.5">
                  {highlights.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-950">
                        <CheckIcon className="h-3 w-3 text-white" />
                      </span>
                      <span className="text-sm leading-snug text-neutral-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          {activeTab === "specs" ? (
            <div className="overflow-hidden border border-neutral-200">
              <div className="grid sm:grid-cols-2">
                {[
                  { label: "Store", value: storeName },
                  { label: "SKU", value: product.sku || "—" },
                  ...lineOptions.map((option) => ({ label: option.name, value: option.value })),
                  ...(product.fabric ? [{ label: "Fabric", value: product.fabric }] : []),
                  ...(category ? [{ label: "Category", value: category.name }] : []),
                  { label: "Care", value: "Ask us before washing" },
                ].map((spec, index) => (
                  <div
                    key={`${spec.label}-${index}`}
                    className={`flex items-center justify-between gap-4 border-b border-neutral-100 px-5 py-4 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 ${
                      index % 2 === 0 ? "bg-white" : "bg-[#faf7f2]"
                    }`}
                  >
                    <span className="text-sm text-neutral-500">{spec.label}</span>
                    <span className="text-right text-sm font-medium text-neutral-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "reviews" ? (
            <p className="py-8 text-sm text-neutral-500">No reviews yet.</p>
          ) : null}

          {activeTab === "shipping" ? (
            <div className="grid gap-6 md:grid-cols-2 md:gap-8">
              <div className="border border-neutral-200 bg-white p-6 md:p-7">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center bg-[#f6f1ea]">
                    <TruckIcon className="h-4 w-4 text-neutral-900" />
                  </span>
                  <h2 className="text-sm font-medium tracking-wide text-neutral-950">How to order</h2>
                </div>
                <ul className="space-y-3 text-sm text-neutral-600">
                  {[
                    "Pick the colour, size, and quantity on this page.",
                    "Send the piece on WhatsApp. The message already includes your choices.",
                    "We confirm availability and help you complete the order.",
                  ].map((line) => (
                    <li key={line} className="flex gap-2.5">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border border-neutral-200 bg-white p-6 md:p-7">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center bg-[#f6f1ea]">
                    <RefreshIcon className="h-4 w-4 text-neutral-900" />
                  </span>
                  <h2 className="text-sm font-medium tracking-wide text-neutral-950">Fit & changes</h2>
                </div>
                <ul className="space-y-3 text-sm text-neutral-600">
                  {[
                    "Use the size guide before you message us.",
                    "If you are between sizes, tell us your measurements.",
                    "Fabric and colour are listed with the piece.",
                  ].map((line) => (
                    <li key={line} className="flex gap-2.5">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {related.length > 0 && category ? (
        <section className="mt-16 border-t border-neutral-200 pt-12 md:mt-20 md:pt-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-neutral-400 uppercase">
                {category.name}
              </p>
              <h2 className="mt-2 text-2xl font-medium tracking-tight text-neutral-950 md:text-3xl">
                You may also like
              </h2>
            </div>
            <Link
              href={`/category/${category.slug}`}
              className="shrink-0 text-sm font-medium text-neutral-700 underline-offset-4 hover:text-neutral-950 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 md:hidden">
            {related.map((item) => (
              <div key={item.id} className="w-[70%] shrink-0">
                <ProductCard product={item} />
              </div>
            ))}
          </div>
          <div className="hidden gap-x-4 gap-y-8 md:grid md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="fixed right-0 bottom-0 left-0 z-40 flex items-center gap-2 border-t border-neutral-200 bg-white p-3 shadow-2xl lg:hidden">
        <a
          href={quoteUrl}
          target={whatsapp ? "_blank" : undefined}
          rel={whatsapp ? "noreferrer" : undefined}
          className="flex h-12 min-w-0 flex-1 items-center justify-center bg-blush px-3 text-sm font-medium"
          style={{ color: "var(--theme-text)" }}
        >
          <span className="truncate">{whatsapp ? `Order · ${shownPrice}` : "Contact the store"}</span>
        </a>
      </div>

      {sizeGuideOpen
        ? createPortal(
            <SizeGuideDialog
              selectedSize={shownSize || ""}
              availableSizes={sizeGroup?.values || sizeChoices}
              onSelect={(size) => {
                if (sizeGroup) {
                  selectOption(sizeGroup.id, size);
                } else {
                  setFallbackSize(size);
                }
                setSizeGuideOpen(false);
              }}
              onClose={() => setSizeGuideOpen(false)}
            />,
            document.body
          )
        : null}
    </div>
  );
}

function Icon({
  className = "h-4 w-4",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

function ShareIcon() {
  return (
    <Icon>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4" />
      <path d="m15.4 6.5-6.8 4" />
    </Icon>
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M20 6 9 17l-5-5" strokeWidth="2.5" />
    </Icon>
  );
}

function MinusIcon() {
  return (
    <Icon className="h-3.5 w-3.5">
      <path d="M5 12h14" />
    </Icon>
  );
}

function PlusIcon() {
  return (
    <Icon className="h-3.5 w-3.5">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </Icon>
  );
}

function FlameIcon() {
  return (
    <Icon className="h-4 w-4 shrink-0 text-neutral-800">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </Icon>
  );
}

function TruckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18h2" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </Icon>
  );
}

function RefreshIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
      <path d="M3 21v-5h5" />
    </Icon>
  );
}

function ShieldIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </Icon>
  );
}

function SizeGuideDialog({
  selectedSize,
  availableSizes,
  onSelect,
  onClose,
}: {
  selectedSize: string;
  availableSizes: string[];
  onSelect: (size: string) => void;
  onClose: () => void;
}) {
  const offered = new Set(availableSizes.map((size) => size.toUpperCase()));

  return (
    <div className="fixed inset-0 z-[80]">
      <button type="button" aria-label="Close size guide" className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-guide-title"
        className="absolute top-1/2 left-1/2 flex max-h-[min(88vh,640px)] w-[min(100%-1.5rem,36rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden bg-white shadow-[0_24px_80px_rgba(22,19,17,0.22)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-black/6 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-neutral-500 uppercase">Fit</p>
            <h2 id="size-guide-title" className="mt-1 text-lg font-medium text-neutral-950">
              Size guide
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close size guide"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-[#f3ebe3]"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">
          <p className="text-sm leading-relaxed text-neutral-600">
            Body measurements for dresses and sets. If you fall between two sizes, pick the larger one.
            Tap a size to select it.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-black/8 text-[11px] font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                  <th className="py-2.5 pr-3 font-semibold">Size</th>
                  <th className="py-2.5 pr-3 font-semibold">Bust</th>
                  <th className="py-2.5 pr-3 font-semibold">Waist</th>
                  <th className="py-2.5 font-semibold">Hip</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_GUIDE.map((row) => {
                  const canPick = offered.size === 0 || offered.has(row.size);
                  const active = selectedSize.toUpperCase() === row.size;

                  return (
                    <tr key={row.size} className={active ? "bg-[#f6f1ea]" : "border-b border-black/4"}>
                      <td className="py-2.5 pr-3">
                        <button
                          type="button"
                          disabled={!canPick}
                          onClick={() => onSelect(row.size)}
                          className={`min-w-10 px-2 py-1 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${
                            active ? "bg-neutral-950 text-white" : "text-neutral-950 hover:bg-neutral-100"
                          }`}
                        >
                          {row.size}
                        </button>
                      </td>
                      <td className="py-2.5 pr-3 text-neutral-700">{row.bust}</td>
                      <td className="py-2.5 pr-3 text-neutral-700">{row.waist}</td>
                      <td className="py-2.5 text-neutral-700">{row.hip}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {MEASURE_STEPS.map((step) => (
              <div key={step.label} className="bg-[#faf7f3] px-3 py-3">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                  {step.label}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-neutral-700">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
