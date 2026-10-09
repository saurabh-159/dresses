"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

type SiteChromeProps = {
  topBar: ReactNode;
  children: ReactNode;
};

export default function SiteChrome({ topBar, children }: SiteChromeProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const promoRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const header = headerRef.current;
    const promo = promoRef.current;
    if (!header || !promo) return;

    const root = document.documentElement;
    let frame = 0;
    let lastY = window.scrollY;
    let accum = 0;
    let compact = false;

    const publish = () => {
      const promoHeight = promo.offsetHeight;
      const shift = compact && promoHeight > 8 ? promoHeight : 0;
      header.classList.toggle("is-compact", shift > 0);
      root.style.setProperty("--site-header-height", `${header.offsetHeight}px`);
      root.style.setProperty("--site-header-shift", `${-shift}px`);
      root.style.setProperty("--site-header-offset", `${header.offsetHeight - shift}px`);
    };

    const setCompact = (next: boolean) => {
      if (next === compact) return;
      compact = next;
      publish();
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const delta = y - lastY;
        lastY = y;

        if (y < 16) {
          accum = 0;
          setCompact(false);
          return;
        }

        if (Math.abs(delta) < 1) return;

        if ((accum > 0 && delta < 0) || (accum < 0 && delta > 0)) {
          accum = 0;
        }
        accum += delta;

        if (accum > 72) {
          setCompact(promo.offsetHeight > 8);
          accum = 0;
        } else if (accum < -40) {
          setCompact(false);
          accum = 0;
        }
      });
    };

    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(header);
    observer.observe(promo);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <div aria-hidden="true" className="site-header-spacer" />
      <div ref={headerRef} className="site-header">
        <div ref={promoRef}>
          <div className="brand-strip" />
          {topBar}
        </div>
        {children}
      </div>
    </>
  );
}
