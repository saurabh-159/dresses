"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type AdminShellProps = {
  children: React.ReactNode;
};

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "dashboard",
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: "category",
  },
  {
    label: "Attributes",
    href: "/admin/attributes",
    icon: "attribute",
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: "product",
  },
  {
    label: "Sliders",
    href: "/admin/sliders",
    icon: "slider",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: "settings",
  },
];

function Icon({ type }: { type: string }) {
  if (type === "dashboard") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  }

  if (type === "category") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 5h16v14H4z" />
        <path d="M8 9h8M8 13h5" />
      </svg>
    );
  }

  if (type === "attribute") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 8h16M4 16h16" />
        <circle cx="8" cy="8" r="2" fill="currentColor" stroke="none" />
        <circle cx="16" cy="16" r="2" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (type === "product") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 7h16v13H4z" />
        <path d="M8 7a4 4 0 0 1 8 0" />
      </svg>
    );
  }

  if (type === "slider") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8" cy="9" r="1.5" />
        <path d="m5 17 4-4 3 3 3-4 4 5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      <path d="m5.6 5.6 2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const title = pathname.startsWith("/admin/categories")
    ? "Categories"
    : pathname.startsWith("/admin/attributes")
      ? "Attributes"
      : pathname.startsWith("/admin/products")
        ? "Products"
        : pathname.startsWith("/admin/sliders")
          ? "Sliders"
          : pathname.startsWith("/admin/settings")
            ? "Settings"
            : pathname === "/admin"
              ? "Dashboard"
              : "Admin Panel";

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await fetch("/api/auth/logout", {
        method: "POST",
      });

      window.location.href = "/admin/login";
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div className="admin-theme min-h-screen bg-paper text-ink">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] border-r border-line bg-white lg:block">
        <div className="flex h-16 items-center border-b border-line px-6">
          <Link href="/admin" className="text-xl font-extrabold text-[var(--theme-accent-dark)]">
            Dresses <span className="text-muted">Admin</span>
          </Link>
        </div>

        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-blush text-[var(--theme-on-accent)] shadow-[0_8px_24px_rgba(196,138,132,0.28)]"
                    : "text-muted hover:bg-espresso hover:text-[var(--theme-accent-dark)]"
                }`}
              >
                <Icon type={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-line p-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
              <path d="M21 19V5a2 2 0 0 0-2-2h-7" />
            </svg>

            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-ink hover:bg-espresso"
          aria-label="Open menu"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <span className="text-lg font-extrabold text-[var(--theme-accent-dark)]">
          Dresses
        </span>

        <div className="w-10" />
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/40"
          />

          <aside className="relative h-full w-[280px] bg-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-line px-5">
              <span className="text-lg font-extrabold text-[var(--theme-accent-dark)]">
                Dresses Admin
              </span>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 hover:bg-espresso"
              >
                ✕
              </button>
            </div>

            <nav className="space-y-1 p-4">
              {navItems.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${
                      active
                        ? "bg-blush text-[var(--theme-on-accent)]"
                        : "text-muted hover:bg-espresso"
                    }`}
                  >
                    <Icon type={item.icon} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 border-t border-line p-4">
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                {loggingOut ? "Logging out..." : "Log out"}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="min-h-screen min-w-0 lg:ml-[260px]">
        <div className="border-b border-line bg-white px-4 py-4 sm:px-8 sm:py-5">
          <h1 className="text-xl font-extrabold text-ink sm:text-2xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage clothes, categories, photos and store details
          </p>
        </div>

        <div className="p-4 sm:p-8">{children}</div>
      </main>
    </div>
  );
}