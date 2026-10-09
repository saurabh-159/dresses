"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedNext = searchParams.get("next") || "/admin";
  const nextPath =
    requestedNext.startsWith("/admin") &&
    !requestedNext.startsWith("//")
      ? requestedNext
      : "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Unable to sign in"
        );

        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch {
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-theme flex min-h-screen items-center justify-center bg-paper px-4 py-10 text-ink">
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-white p-7 shadow-2xl sm:p-9">
          {/* Logo */}
          <div className="text-center">
            <div className="text-3xl font-extrabold tracking-tight text-[var(--theme-accent-dark)]">
              Dresses
            </div>

            <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-ink">
              Admin Panel
            </p>
          </div>

          <div className="mt-8">
            <h1 className="text-2xl font-extrabold text-ink">
              Admin sign in
            </h1>

            <p className="mt-2 text-sm text-muted">
              Sign in to manage the clothing store.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-5"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold text-ink"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                autoComplete="email"
                className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none transition focus:border-[var(--theme-accent)] focus:ring-2 focus:ring-[var(--theme-accent)]/30"
                placeholder="admin@dresses.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-bold text-ink"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none transition focus:border-[var(--theme-accent)] focus:ring-2 focus:ring-[var(--theme-accent)]/30"
                placeholder="Enter password"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blush px-5 py-3.5 text-sm font-extrabold text-[var(--theme-on-accent)] transition hover:bg-blush-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>

          <p className="mt-7 text-center text-xs text-muted">
            Store admin
          </p>
        </div>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className="admin-theme min-h-screen bg-paper" />}>
      <AdminLoginForm />
    </Suspense>
  );
}