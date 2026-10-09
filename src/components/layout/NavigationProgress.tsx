"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type Phase = "idle" | "loading" | "finishing";

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function isSameDocument(url: URL) {
  const current = new URL(window.location.href);
  current.searchParams.delete("_rsc");
  url.searchParams.delete("_rsc");
  return url.origin === current.origin && url.pathname === current.pathname && url.search === current.search;
}

function shouldStartFromAnchor(event: MouseEvent) {
  if (isModifiedClick(event)) return false;

  const target = event.target;
  if (!(target instanceof Element)) return false;

  const anchor = target.closest("a");
  if (!anchor) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;

  try {
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    return !isSameDocument(url);
  } catch {
    return false;
  }
}

function headerValue(input: RequestInfo | URL, init: RequestInit | undefined, name: string) {
  const headers = new Headers(init?.headers ?? undefined);

  if (input instanceof Request) {
    input.headers.forEach((value, key) => {
      if (!headers.has(key)) headers.append(key, value);
    });
  }

  return headers.get(name);
}

function shouldStartFromFetch(input: RequestInfo | URL, init?: RequestInit) {
  if (headerValue(input, init, "rsc") !== "1") return false;
  if (headerValue(input, init, "next-router-prefetch")) return false;
  if (headerValue(input, init, "next-router-segment-prefetch")) return false;
  if (headerValue(input, init, "next-hmr-refresh")) return false;
  if (headerValue(input, init, "next-action")) return false;

  try {
    const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const url = new URL(raw, window.location.href);
    if (url.origin !== window.location.origin) return false;
    return !isSameDocument(url);
  } catch {
    return false;
  }
}

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;

  const [phase, setPhase] = useState<Phase>("idle");
  const [width, setWidth] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const pendingRef = useRef(false);
  const routeKeyRef = useRef(routeKey);
  const startedAtRef = useRef(0);
  const beginRef = useRef(() => {});

  beginRef.current = () => {
    if (!pendingRef.current) {
      startedAtRef.current = Date.now();
      setWidth(8);
      setVisible(false);
    }

    pendingRef.current = true;
    setPhase("loading");
    setAttempt((current) => current + 1);
  };

  useEffect(() => {
    function begin() {
      beginRef.current();
    }

    function onClick(event: MouseEvent) {
      if (shouldStartFromAnchor(event)) begin();
    }

    function onPopState() {
      begin();
    }

    function onSubmit(event: Event) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if ((form.getAttribute("method") || "get").toLowerCase() !== "get") return;

      try {
        const url = new URL(form.action, window.location.href);
        if (url.origin !== window.location.origin || isSameDocument(url)) return;
        begin();
      } catch {
        return;
      }
    }

    const originalFetch = window.fetch.bind(window);
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      if (shouldStartFromFetch(input, init)) begin();
      return originalFetch(input, init);
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      window.removeEventListener("popstate", onPopState);
      window.fetch = originalFetch;
    };
  }, []);

  useEffect(() => {
    if (routeKey === routeKeyRef.current) return;
    routeKeyRef.current = routeKey;
    if (!pendingRef.current) return;

    pendingRef.current = false;

    if (Date.now() - startedAtRef.current < 120) {
      setPhase("idle");
      setWidth(0);
      setVisible(false);
      return;
    }

    setWidth(100);
    setPhase("finishing");
  }, [routeKey]);

  useEffect(() => {
    if (phase !== "loading") return;

    const show = window.setTimeout(() => setVisible(true), 90);

    const timer = window.setInterval(() => {
      setWidth((current) => {
        if (current >= 90) return current;
        const remaining = 90 - current;
        return Math.min(90, current + Math.max(0.5, remaining * 0.08));
      });
    }, 180);

    const giveUp = window.setTimeout(() => {
      pendingRef.current = false;
      setPhase("idle");
      setWidth(0);
      setVisible(false);
    }, 15000);

    return () => {
      window.clearTimeout(show);
      window.clearInterval(timer);
      window.clearTimeout(giveUp);
    };
  }, [phase, attempt]);

  useEffect(() => {
    if (phase !== "finishing") return;

    const fadeTimer = window.setTimeout(() => setFadeOut(true), 180);
    const hideTimer = window.setTimeout(() => {
      setPhase("idle");
      setWidth(0);
      setVisible(false);
      setFadeOut(false);
    }, 460);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [phase]);

  if (phase === "idle") return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-1 bg-[#f3c3cb]"
      style={{
        opacity: fadeOut || !visible ? 0 : 1,
        transition: "opacity 180ms ease",
      }}
      role="progressbar"
      aria-hidden="true"
    >
      <div
        className="relative h-full"
        style={{
          width: `${width}%`,
          transition: "width 220ms ease-out",
        }}
      >
        <div
          className="h-full bg-[#e11d48]"
          style={{ boxShadow: "0 0 12px #e11d48" }}
        />
        <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-r from-transparent to-white" />
      </div>
    </div>
  );
}

