"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CatalogCard from "@/components/product/CatalogCard";

type ProductItem = {
  id: string;
  name: string;
  slug: string;
  priceText: string;
  categoryName?: string;
  images: { url: string }[];
  videos?: { url: string }[];
};

type FeaturedProductsProps = {
  products: ProductItem[];
};

const AUTO_MS = 4000;
const MOVE_MS = 380;

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
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

  const loopLength = products.length;
  const slides = useMemo(
    () => [0, 1, 2].flatMap((copy) => products.map((product) => ({ ...product, copy }))),
    [products]
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
  const canSlide = products.length > 1 && !reducedMotion && inView;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

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
      if (!card || card.offsetWidth < 8) return;

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
  }, [products.length]);

  useEffect(() => {
    if (step === 0) return;
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [step]);

  useEffect(() => {
    if (withTransition || pendingStep.current === 0) return;

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
    if (!canSlide || paused || dragging || !withTransition || step === 0) return;

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
    if (products.length < 2) return;

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
    if (products.length < 2 || event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest("button")) return;

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
    if (!dragRef.current.active) return;

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
    if (!dragRef.current.active) return;

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

  if (products.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden bg-white py-10 md:py-16 lg:py-20"
      aria-label="Featured products"
    >
      <div className="flex items-end justify-between gap-4 px-4 md:gap-8 md:px-5 lg:px-6">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-tight text-stone-950 md:text-[2.5rem]">
            Featured Products
          </h2>
          <p className="mt-2 max-w-xl text-sm text-stone-500 sm:text-base">
            Fresh embroidered chanderi suits and lehengas from the new drop.
          </p>
        </div>

        {products.length > 1 ? (
          <div className="mb-1 hidden shrink-0 gap-2.5 md:flex">
            <button
              type="button"
              onClick={() => shift(-1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-800 shadow-sm transition duration-200 hover:border-gold hover:text-wine"
              aria-label="Previous products"
            >
              <Chevron direction="left" />
            </button>
            <button
              type="button"
              onClick={() => shift(1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-800 shadow-sm transition duration-200 hover:border-gold hover:text-wine"
              aria-label="Next products"
            >
              <Chevron direction="right" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 px-4 md:hidden">
        {products.map((product) => (
          <CatalogCard key={product.id} product={product} />
        ))}
      </div>

      <div
        className="swipe-row mt-8 hidden cursor-grab touch-pan-y active:cursor-grabbing md:block"
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
          className="flex gap-4 pl-4 sm:pl-5 lg:pl-6"
          style={{
            transform: `translate3d(${-index * step + dragX}px, 0, 0)`,
            transition:
              ready && withTransition && !dragging
                ? `transform ${MOVE_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
                : "none",
          }}
        >
          {slides.map((product, slideIndex) => (
            <CatalogCard
              key={`${product.copy}-${product.id}-${slideIndex}`}
              product={product}
              className="w-[240px] shrink-0 sm:w-[270px] lg:w-[300px]"
            />
          ))}
        </div>
      </div>
    </section>
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
