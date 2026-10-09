"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import MediaCover from "@/components/media/MediaCover";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  videoUrl?: string | null;
  parentName: string | null;
  itemCount: number;
};

type CategoryGridProps = {
  categories: CategoryItem[];
};

const AUTO_MS = 4000;
const MOVE_MS = 650;

function loopCategories(categories: CategoryItem[]) {
  if (categories.length === 0) {
    return [];
  }

  const repeats = categories.length >= 5 ? 1 : Math.ceil(5 / categories.length);
  return Array.from({ length: repeats }, () => categories).flat();
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const pendingStep = useRef<0 | 1 | -1>(0);
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    delta: number;
    captured: boolean;
    blockDrag?: (event: Event) => void;
  }>({ active: false, startX: 0, delta: 0, captured: false });
  const suppressClick = useRef(false);

  const loopItems = useMemo(() => loopCategories(categories), [categories]);
  const loopLength = loopItems.length;
  const slides = useMemo(
    () => [0, 1, 2].flatMap((copy) => loopItems.map((category) => ({ ...category, copy }))),
    [loopItems]
  );

  const [index, setIndex] = useState(loopLength);
  const [withTransition, setWithTransition] = useState(true);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [step, setStep] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(true);

  indexRef.current = index;
  const canSlide = categories.length > 1 && !reducedMotion && inView;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "150px" }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const measure = () => {
      const card = trackRef.current?.querySelector<HTMLElement>("[data-card]");
      if (!card) {
        return;
      }

      const gap = trackRef.current
        ? Number.parseFloat(getComputedStyle(trackRef.current).columnGap || "16")
        : 16;
      setStep(card.offsetWidth + (Number.isFinite(gap) ? gap : 16));
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (trackRef.current) observer.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [categories.length]);

  useEffect(() => {
    if (step === 0) {
      return;
    }

    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [step]);

  useEffect(() => {
    if (withTransition || pendingStep.current === 0) {
      return;
    }

    const direction = pendingStep.current;
    pendingStep.current = 0;
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        setWithTransition(true);
        setIndex((value) => value + direction);
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [withTransition, index]);

  useEffect(() => {
    if (!canSlide || paused || dragging || !withTransition || step === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      const current = indexRef.current;
      if (current >= loopLength * 2) {
        pendingStep.current = 1;
        setWithTransition(false);
        setIndex(current - loopLength);
        return;
      }
      setIndex(current + 1);
    }, AUTO_MS);

    return () => window.clearTimeout(timer);
  }, [canSlide, paused, dragging, withTransition, step, index, loopLength]);

  function shift(direction: 1 | -1) {
    if (categories.length < 2) {
      return;
    }

    const current = indexRef.current;

    if (direction > 0 && current >= loopLength * 2) {
      pendingStep.current = 1;
      setWithTransition(false);
      setIndex(current - loopLength);
      return;
    }

    if (direction < 0 && current <= loopLength) {
      pendingStep.current = -1;
      setWithTransition(false);
      setIndex(current + loopLength);
      return;
    }

    setWithTransition(true);
    setIndex(current + direction);
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (categories.length < 2 || event.button !== 0) {
      return;
    }

    const node = event.currentTarget;
    const blockDrag = (dragEvent: Event) => dragEvent.preventDefault();
    node.addEventListener("dragstart", blockDrag, true);
    setPaused(true);
    dragRef.current = {
      active: true,
      startX: event.clientX,
      delta: 0,
      captured: false,
      blockDrag,
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) {
      return;
    }

    const delta = event.clientX - dragRef.current.startX;
    dragRef.current.delta = delta;

    if (!dragRef.current.captured) {
      if (Math.abs(delta) < 8) return;
      dragRef.current.captured = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
      setPaused(true);
      setWithTransition(false);
    }

    setDragX(delta);
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) {
      return;
    }

    const delta = dragRef.current.delta;
    const blockDrag = dragRef.current.blockDrag;
    dragRef.current.active = false;
    dragRef.current.blockDrag = undefined;
    if (blockDrag) event.currentTarget.removeEventListener("dragstart", blockDrag, true);
    setDragging(false);
    setDragX(0);
    setPaused(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (Math.abs(delta) > 40) {
      suppressClick.current = true;
      shift(delta < 0 ? 1 : -1);
      return;
    }

    setWithTransition(true);
  }

  if (categories.length === 0) {
    return null;
  }

  const seen = new Set<string>();

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden py-10 md:py-16 lg:py-20"
      aria-roledescription="carousel"
      aria-label="Shop by category"
    >
      <div className="flex items-end justify-between gap-4 px-4 md:gap-8 md:px-5 lg:px-6">
        <div className="min-w-0">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
            <span className="h-px w-7 bg-gold" />
            Collections
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950 md:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-2 max-w-md text-sm text-stone-500 sm:text-base">
            Dresses, kurtis, sarees, and everything in between.
          </p>
        </div>

        {categories.length > 1 ? (
          <div className="mb-1 hidden shrink-0 gap-2.5 md:flex">
            <button
              type="button"
              onClick={() => shift(-1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-800 shadow-sm transition duration-200 hover:border-gold hover:text-wine"
              aria-label="Previous categories"
            >
              <Chevron direction="left" />
            </button>
            <button
              type="button"
              onClick={() => shift(1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-800 shadow-sm transition duration-200 hover:border-gold hover:text-wine"
              aria-label="Next categories"
            >
              <Chevron direction="right" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-6 px-4 md:mt-8 md:px-0">
        <div
          className="swipe-row cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={(event) => {
            if (!suppressClick.current) return;
            event.preventDefault();
            event.stopPropagation();
            suppressClick.current = false;
          }}
        >
          <div
            ref={trackRef}
            data-track
            className="flex w-full gap-3 md:gap-4 md:pl-5 lg:pl-6"
            style={{
              transform: `translate3d(${-index * step + dragX}px, 0, 0)`,
              transition:
                ready && withTransition && !dragging
                  ? `transform ${MOVE_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
                  : "none",
            }}
          >
            {slides.map((category, slideIndex) => {
              const interactive = category.copy === 1 && !seen.has(category.id);
              if (interactive) seen.add(category.id);

              return (
                <CategoryCard
                  key={`${category.copy}-${category.id}-${slideIndex}`}
                  category={category}
                  interactive={interactive}
                  className="group relative aspect-[3/4] w-[calc((100%-0.75rem)/2)] shrink-0 overflow-hidden rounded-2xl bg-stone-200 md:aspect-auto md:h-[430px] md:w-[250px] md:rounded-[22px] lg:h-[470px] lg:w-[280px]"
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  className,
  interactive = true,
}: {
  category: CategoryItem;
  className: string;
  interactive?: boolean;
}) {
  return (
    <Link
      href={`/category/${category.slug}`}
      data-card
      draggable={false}
      aria-hidden={!interactive}
      tabIndex={interactive ? undefined : -1}
      className={className}
    >
      {category.videoUrl || category.imageUrl ? (
        <MediaCover
          imageUrl={category.imageUrl}
          videoUrl={category.videoUrl}
          alt=""
          imageWidth={640}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-400 to-stone-700 text-4xl font-semibold text-white sm:text-5xl">
          {category.name.charAt(0)}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-5">
        <p className="truncate text-[10px] font-medium uppercase tracking-[0.16em] text-white/75 sm:text-[11px]">
          {category.parentName || "Collection"}
        </p>
        <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-tight sm:text-xl">
          {category.name}
        </h3>
        <p className="mt-1 text-[11px] text-white/75 sm:text-sm">
          {category.itemCount} {category.itemCount === 1 ? "item" : "items"}
        </p>
      </div>
    </Link>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {direction === "left" ? (
        <path d="M14.5 6.5 9 12l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M9.5 6.5 15 12l-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}
