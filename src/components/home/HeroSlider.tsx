"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { optimizedImageUrl } from "@/lib/images";

type Slider = {
  id: string;
  title: string;
  url?: string;
  videoUrl?: string;
  linkUrl?: string;
  sortOrder: number;
};

type HeroSliderProps = {
  sliders: Slider[];
};

export default function HeroSlider({ sliders }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalSlides = sliders.length;

  useEffect(() => {
    if (totalSlides <= 1 || isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(interval);
  }, [totalSlides, isPaused]);

  if (!sliders.length) {
    return (
      <section className="bg-paper">
        <div className="container-aw py-20 sm:py-28">
          <div className="max-w-3xl text-stone-800">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-gold">
              New in store
            </p>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Dresses, kurtis and sarees
            </h1>
            <p className="mt-6 max-w-2xl text-base text-stone-600 sm:text-lg">
              Browse ready-to-wear clothing, check sizes and fabric, then message the store to order.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="rounded-xl bg-blush px-6 py-3 font-bold text-stone-800">
                Shop clothes
              </Link>
              <Link href="/contact" className="rounded-xl border border-stone-300 bg-white px-6 py-3 font-bold text-stone-800">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentSlide = sliders[activeIndex];

  const slideContent = (
    <div
      className="relative h-[240px] overflow-hidden bg-paper sm:h-[300px] md:h-[360px] lg:h-[420px] xl:h-[480px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {currentSlide.videoUrl ? (
        <video
          key={currentSlide.videoUrl}
          src={currentSlide.videoUrl}
          poster={currentSlide.url ? optimizedImageUrl(currentSlide.url, 1920, { fit: "max" }) : undefined}
          muted
          loop
          playsInline
          autoPlay
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      ) : currentSlide.url ? (
        <img
          src={optimizedImageUrl(currentSlide.url, 1920, { fit: "max" })}
          alt={currentSlide.title}
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      ) : (
        <div className="absolute inset-0 bg-blush" />
      )}

      {totalSlides > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={(event) => {
              event.preventDefault();
              setActiveIndex((current) => (current - 1 + totalSlides) % totalSlides);
            }}
            className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/80 px-4 py-3 text-stone-900 sm:block"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={(event) => {
              event.preventDefault();
              setActiveIndex((current) => (current + 1) % totalSlides);
            }}
            className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/80 px-4 py-3 text-stone-900 sm:block"
          >
            →
          </button>
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {sliders.map((slider, index) => (
              <button
                key={slider.id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={(event) => {
                  event.preventDefault();
                  setActiveIndex(index);
                }}
                className={`h-2 rounded-full ${index === activeIndex ? "w-8 bg-blush-dark" : "w-2 bg-white"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  if (currentSlide.linkUrl) {
    return (
      <section>
        <Link href={currentSlide.linkUrl}>{slideContent}</Link>
      </section>
    );
  }

  return <section>{slideContent}</section>;
}
