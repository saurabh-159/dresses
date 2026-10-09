"use client";

import { useEffect, useState } from "react";

import ImageUploader from "@/components/admin/ImageUpload";

type Settings = {
  siteName: string;
  tagline: string;
  footerBlurb: string;
  aboutText: string;
  hours: string;
  address: string;
  phone1: string;
  phone2: string;
  email: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  logoFileId: string;
  logoUrl: string;
  logoPath: string;
};

const emptySettings: Settings = {
  siteName: "Dresses",
  tagline: "",
  footerBlurb: "",
  aboutText: "",
  hours: "",
  address: "",
  phone1: "",
  phone2: "",
  email: "",
  whatsapp: "",
  facebook: "",
  instagram: "",
  linkedin: "",
  logoFileId: "",
  logoUrl: "",
  logoPath: "",
};

export default function SettingsPage() {
  const [form, setForm] =
    useState<Settings>(emptySettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/settings");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load settings"
        );
      }

      setForm({
        siteName: data.siteName || "Dresses",
        tagline: data.tagline || "",
        footerBlurb: data.footerBlurb || "",
        aboutText: data.aboutText || "",
        hours: data.hours || "",
        address: data.address || "",
        phone1: data.phone1 || "",
        phone2: data.phone2 || "",
        email: data.email || "",
        whatsapp: data.whatsapp || "",
        facebook: data.facebook || "",
        instagram: data.instagram || "",
        linkedin: data.linkedin || "",
        logoFileId: data.logoFileId || "",
        logoUrl: data.logoUrl || "",
        logoPath: data.logoPath || "",
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load settings"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function handleChange(
    field: keyof Settings,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSuccess("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save settings"
        );
      }

      setSuccess("Settings saved successfully.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save settings"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-line bg-white p-10 text-center text-sm text-muted">
        Loading settings...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {/* Brand */}
      <section className="rounded-2xl border border-line bg-white p-4 shadow-[0_8px_30px_rgba(92,74,66,0.06)] sm:p-5">
        <h2 className="text-lg font-extrabold text-ink">
          Brand & Footer
        </h2>

        <p className="mt-1 text-sm text-muted">
          Public website branding and footer content.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-1">
          <div className="min-w-0">
            <label className="mb-1.5 block text-sm font-semibold">
              Store name
            </label>

            <input
              value={form.siteName}
              onChange={(event) =>
                handleChange("siteName", event.target.value)
              }
              placeholder="Dresses"
              className="w-full min-w-0 rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-[var(--theme-accent)] sm:px-4 sm:py-3"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Tagline
            </label>

            <input
              value={form.tagline}
              onChange={(event) =>
                handleChange(
                  "tagline",
                  event.target.value
                )
              }
              placeholder="Dresses, kurtis, sarees and everyday wear"
              className="w-full min-w-0 rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-[var(--theme-accent)] sm:px-4 sm:py-3"
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="mb-1.5 block text-sm font-semibold">
              Footer Blurb
            </label>

            <textarea
              rows={4}
              value={form.footerBlurb}
              onChange={(event) =>
                handleChange(
                  "footerBlurb",
                  event.target.value
                )
              }
              className="w-full min-w-0 resize-none rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-[var(--theme-accent)] sm:px-4 sm:py-3"
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="mb-1.5 block text-sm font-semibold">
              About page
            </label>

            <textarea
              rows={5}
              value={form.aboutText}
              onChange={(event) =>
                handleChange("aboutText", event.target.value)
              }
              placeholder="Short description of the clothing store"
              className="w-full min-w-0 resize-none rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-[var(--theme-accent)] sm:px-4 sm:py-3"
            />
          </div>

          <div className="col-span-2 rounded-xl bg-espresso p-4 md:col-span-1">
            <p className="mb-3 text-sm font-bold">
              Logo
            </p>

            <ImageUploader
              folder="/dresses/site"
              multiple={false}
              onUpload={(uploadedImages) => {
                const image = uploadedImages[0];

                if (!image) {
                  return;
                }

                setForm((previous) => ({
                  ...previous,
                  logoFileId: image.fileId,
                  logoUrl: image.url,
                  logoPath: image.filePath,
                }));
              }}
            />

            {form.logoUrl && (
              <div className="mt-4 inline-flex rounded-xl border border-line bg-white p-4">
                <img
                  src={form.logoUrl}
                  alt="Store logo"
                  className="h-16 w-auto object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="rounded-2xl border border-line bg-white p-4 shadow-[0_8px_30px_rgba(92,74,66,0.06)] sm:p-5">
        <h2 className="text-lg font-extrabold text-ink">
          Contact Information
        </h2>

        <p className="mt-1 text-sm text-muted">
          These details appear across the public website.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5">
          <div className="col-span-2">
            <label className="mb-1.5 block text-sm font-semibold">
              Address
            </label>

            <textarea
              rows={3}
              value={form.address}
              onChange={(event) =>
                handleChange(
                  "address",
                  event.target.value
                )
              }
              className="w-full min-w-0 resize-none rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-[var(--theme-accent)] sm:px-4 sm:py-3"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Business Hours
            </label>

            <input
              value={form.hours}
              onChange={(event) =>
                handleChange(
                  "hours",
                  event.target.value
                )
              }
              placeholder="All Days: 10:00 AM – 9:00 PM"
              className="w-full min-w-0 rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-[var(--theme-accent)] sm:px-4 sm:py-3"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Email
            </label>

            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                handleChange(
                  "email",
                  event.target.value
                )
              }
              className="w-full min-w-0 rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-[var(--theme-accent)] sm:px-4 sm:py-3"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Phone 1
            </label>

            <input
              value={form.phone1}
              onChange={(event) =>
                handleChange(
                  "phone1",
                  event.target.value
                )
              }
              className="w-full min-w-0 rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-[var(--theme-accent)] sm:px-4 sm:py-3"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Phone 2
            </label>

            <input
              value={form.phone2}
              onChange={(event) =>
                handleChange(
                  "phone2",
                  event.target.value
                )
              }
              className="w-full min-w-0 rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-[var(--theme-accent)] sm:px-4 sm:py-3"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              WhatsApp Number
            </label>

            <input
              value={form.whatsapp}
              onChange={(event) =>
                handleChange(
                  "whatsapp",
                  event.target.value
                )
              }
              placeholder="919891805316"
              className="w-full min-w-0 rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-[var(--theme-accent)] sm:px-4 sm:py-3"
            />

            <p className="mt-1 text-xs text-muted">
              Include country code, without + or spaces.
            </p>
          </div>
        </div>
      </section>

      {/* Social */}
      <section className="rounded-2xl border border-line bg-white p-4 shadow-[0_8px_30px_rgba(92,74,66,0.06)] sm:p-5">
        <h2 className="text-lg font-extrabold text-ink">
          Social Links
        </h2>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Facebook
            </label>

            <input
              value={form.facebook}
              onChange={(event) =>
                handleChange(
                  "facebook",
                  event.target.value
                )
              }
              placeholder="https://www.facebook.com/yourstore"
              className="w-full min-w-0 rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-[var(--theme-accent)] sm:px-4 sm:py-3"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Instagram
            </label>

            <input
              value={form.instagram}
              onChange={(event) =>
                handleChange(
                  "instagram",
                  event.target.value
                )
              }
              placeholder="https://www.instagram.com/yourstore/"
              className="w-full min-w-0 rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-[var(--theme-accent)] sm:px-4 sm:py-3"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              LinkedIn
            </label>

            <input
              value={form.linkedin}
              onChange={(event) =>
                handleChange(
                  "linkedin",
                  event.target.value
                )
              }
              placeholder="https://www.linkedin.com/company/yourstore"
              className="w-full min-w-0 rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-[var(--theme-accent)] sm:px-4 sm:py-3"
            />
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="sticky bottom-4 z-20">
        <div className="flex items-center justify-between rounded-2xl border border-line bg-white/95 p-4 shadow-xl backdrop-blur">
          <p className="hidden text-sm text-muted sm:block">
            Changes will appear on the public website.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-blush px-6 py-3 font-bold text-[var(--theme-on-accent)] transition hover:bg-blush-dark disabled:opacity-60 sm:ml-auto sm:w-auto"
          >
            {saving
              ? "Saving..."
              : "Save Settings"}
          </button>
        </div>
      </div>
    </form>
  );
}