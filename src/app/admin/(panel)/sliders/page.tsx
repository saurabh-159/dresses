"use client";

import { useEffect, useState } from "react";

import ImageUploader from "@/components/admin/ImageUpload";

type Slider = {
  id: string;
  title: string;
  fileId: string;
  url: string;
  filePath: string;
  videoFileId: string;
  videoUrl: string;
  videoPath: string;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
};

type FormData = {
  title: string;
  fileId: string;
  url: string;
  filePath: string;
  videoFileId: string;
  videoUrl: string;
  videoPath: string;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
};

const emptyForm: FormData = {
  title: "",
  fileId: "",
  url: "",
  filePath: "",
  videoFileId: "",
  videoUrl: "",
  videoPath: "",
  linkUrl: "",
  sortOrder: 0,
  isActive: true,
};

export default function SlidersPage() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [form, setForm] = useState<FormData>(emptyForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadSliders() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/sliders");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load sliders"
        );
      }

      setSliders(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load sliders"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSliders();
  }, []);

  function handleChange(
    field: keyof FormData,
    value: string | boolean | number
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  function startEdit(slider: Slider) {
    setEditingId(slider.id);

    setForm({
      title: slider.title,
      fileId: slider.fileId,
      url: slider.url,
      filePath: slider.filePath,
      videoFileId: slider.videoFileId || "",
      videoUrl: slider.videoUrl || "",
      videoPath: slider.videoPath || "",
      linkUrl: slider.linkUrl,
      sortOrder: slider.sortOrder,
      isActive: slider.isActive,
    });

    setError("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Slider title is required.");
      return;
    }

    if (!form.url.trim() && !form.videoUrl.trim()) {
      setError("Upload a slider image or video.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: form.title,
        fileId: form.fileId,
        url: form.url,
        filePath: form.filePath,
        videoFileId: form.videoFileId,
        videoUrl: form.videoUrl,
        videoPath: form.videoPath,
        linkUrl: form.linkUrl,
        sortOrder: Number(form.sortOrder),
        isActive: form.isActive,
      };

      const url = editingId
        ? `/api/sliders/${editingId}`
        : "/api/sliders";

      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save slider"
        );
      }

      await loadSliders();

      startCreate();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save slider"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slider: Slider) {
    const confirmed = window.confirm(
      `Delete "${slider.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `/api/sliders/${slider.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete slider"
        );
      }

      if (editingId === slider.id) {
        startCreate();
      }

      await loadSliders();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete slider"
      );
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      {/* Form */}
      <section className="h-fit rounded-2xl border border-line bg-white p-5 shadow-[0_8px_30px_rgba(92,74,66,0.06)]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-ink">
              {editingId
                ? "Edit Slider"
                : "Add Slider"}
            </h2>

            <p className="mt-1 text-sm text-muted">
              Manage homepage hero banners.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={startCreate}
              className="text-sm font-bold text-[var(--theme-accent-dark)] hover:underline"
            >
              New
            </button>
          )}
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Title
            </label>

            <input
              value={form.title}
              onChange={(event) =>
                handleChange(
                  "title",
                  event.target.value
                )
              }
              placeholder="Premium trophies"
              className="w-full min-w-0 rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-[var(--theme-accent)] sm:px-4 sm:py-3"
            />
          </div>

          {/* Image */}
          <div className="rounded-xl bg-espresso p-4">
            <p className="mb-3 text-sm font-bold text-ink">
              Slider Image
            </p>

            <div className="mb-3 rounded-xl border border-line bg-espresso px-3 py-3 text-xs leading-5 text-ink">
              <p className="font-bold">Banner size</p>
              <p className="mt-1">
                Upload a wide banner at <span className="font-bold">1920 × 480 px</span> (width × height).
                Homepage height stays like a banner: about 240px on phone and 480px on desktop.
              </p>
              <p className="mt-1">Keep the main subject in the center. JPG or PNG, under 2 MB. Use this same size for every slide.</p>
            </div>

            <ImageUploader
              folder="/dresses/sliders"
              multiple={false}
              onUpload={(uploadedImages) => {
                const image = uploadedImages[0];

                if (!image) {
                  return;
                }

                setForm((previous) => ({
                  ...previous,
                  fileId: image.fileId,
                  url: image.url,
                  filePath: image.filePath,
                }));
              }}
            />

            {form.url && (
              <div className="mt-4 overflow-hidden rounded-xl border border-line bg-white">
                <div className="h-[120px] overflow-hidden">
                  <img
                    src={form.url}
                    alt={form.title || "Slider"}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <p className="border-t border-line px-3 py-2 text-xs text-muted">
                  Banner preview. The homepage uses this short height.
                </p>
              </div>
            )}

            {form.filePath && (
              <p className="mt-2 break-all text-xs text-muted">
                {form.filePath}
              </p>
            )}
          </div>

          <div className="rounded-xl bg-espresso p-4">
            <p className="mb-3 text-sm font-bold text-ink">
              Slider Video
            </p>

            <ImageUploader
              folder="/dresses/sliders"
              kind="video"
              onUpload={(uploaded) => {
                const video = uploaded[0];

                if (!video) {
                  return;
                }

                setForm((previous) => ({
                  ...previous,
                  videoFileId: video.fileId,
                  videoUrl: video.url,
                  videoPath: video.filePath,
                }));
              }}
            />

            {form.videoUrl ? (
              <video
                src={form.videoUrl}
                controls
                className="mt-4 h-40 w-full rounded-xl bg-black object-contain"
              />
            ) : null}
          </div>

          {/* Link */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Link URL
            </label>

            <input
              value={form.linkUrl}
              onChange={(event) =>
                handleChange(
                  "linkUrl",
                  event.target.value
                )
              }
              placeholder="/category/dresses"
              className="w-full min-w-0 rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-[var(--theme-accent)] sm:px-4 sm:py-3"
            />

            <p className="mt-1 text-xs text-muted">
              Optional. Whole slide can link to this URL.
            </p>
          </div>

          {/* Sort */}
          <div className="grid grid-cols-2 gap-3 md:block">
            <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Sort Order
            </label>

            <input
              type="number"
              value={form.sortOrder}
              onChange={(event) =>
                handleChange(
                  "sortOrder",
                  Number(event.target.value)
                )
              }
              className="w-full min-w-0 rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-[var(--theme-accent)] sm:px-4 sm:py-3"
            />
            </div>
          </div>

          {/* Active */}
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-line px-4 py-3">
            <div>
              <p className="text-sm font-bold text-ink">
                Active
              </p>

              <p className="text-xs text-muted">
                Show this slider on homepage.
              </p>
            </div>

            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                handleChange(
                  "isActive",
                  event.target.checked
                )
              }
              className="h-5 w-5 accent-[var(--theme-accent)]"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-blush px-5 py-3 font-bold text-[var(--theme-on-accent)] transition hover:bg-blush-dark disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Update Slider"
                : "Create Slider"}
          </button>
        </form>
      </section>

      {/* Slider list */}
      <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_30px_rgba(92,74,66,0.06)]">
        <div className="border-b border-line px-5 py-5">
          <h2 className="text-lg font-extrabold text-ink">
            All Sliders
          </h2>

          <p className="mt-1 text-sm text-muted">
            {sliders.length} sliders
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-muted">
            Loading sliders...
          </div>
        ) : sliders.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted">
            No sliders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-line bg-espresso text-left">
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                    Preview
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                    Slider
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                    Order
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                    Status
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {sliders.map((slider) => (
                  <tr
                    key={slider.id}
                    className="border-b border-line last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      {slider.url ? (
                        <img
                          src={slider.url}
                          alt={slider.title}
                          className="h-16 w-28 rounded-lg bg-espresso object-contain"
                        />
                      ) : (
                        <div className="flex h-16 w-28 items-center justify-center rounded-lg bg-blush text-xs font-bold text-[var(--theme-on-accent)]">
                          No Image
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-bold text-ink">
                        {slider.title}
                      </p>

                      {slider.linkUrl && (
                        <p className="mt-1 max-w-xs truncate text-xs text-muted">
                          {slider.linkUrl}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm font-bold text-ink">
                      {slider.sortOrder}
                    </td>

                    <td className="px-5 py-4">
                      {slider.isActive ? (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() =>
                            startEdit(slider)
                          }
                          className="text-sm font-bold text-[var(--theme-accent-dark)] hover:underline"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(slider)
                          }
                          className="text-sm font-bold text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}