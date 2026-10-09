"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUpload";

export type CategoryDraft = {
  name: string;
  slug: string;
  parentId: string;
  imageFileId: string;
  imageUrl: string;
  imagePath: string;
  videoFileId: string;
  videoUrl: string;
  videoPath: string;
  showOnHome: boolean;
  sortOrder: number;
  isActive: boolean;
};

type CategoryOption = {
  id: string;
  name: string;
};

const emptyDraft: CategoryDraft = {
  name: "",
  slug: "",
  parentId: "",
  imageFileId: "",
  imageUrl: "",
  imagePath: "",
  videoFileId: "",
  videoUrl: "",
  videoPath: "",
  showOnHome: false,
  sortOrder: 0,
  isActive: true,
};

const fieldClass =
  "w-full min-w-0 rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--theme-accent)] focus:ring-2 focus:ring-[var(--theme-accent)]/30 sm:px-4 sm:py-3";

type CategoryFormProps = {
  categoryId?: string;
  initial?: CategoryDraft;
};

export default function CategoryForm({ categoryId, initial }: CategoryFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [form, setForm] = useState<CategoryDraft>(initial || emptyDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(
            data.map((item: CategoryOption) => ({
              id: item.id,
              name: item.name,
            }))
          );
        }
      })
      .catch(() => setCategories([]));
  }, []);

  function handleChange<K extends keyof CategoryDraft>(field: K, value: CategoryDraft[K]) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        categoryId ? `/api/categories/${categoryId}` : "/api/categories",
        {
          method: categoryId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            parentId: form.parentId || null,
            sortOrder: Number(form.sortOrder),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save category");
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save category");
    } finally {
      setSaving(false);
    }
  }

  const parentOptions = categories.filter((category) => category.id !== categoryId);

  return (
    <form
      onSubmit={handleSubmit}
      className="grid max-w-3xl grid-cols-2 gap-3 rounded-2xl border border-line bg-white p-4 shadow-[0_8px_30px_rgba(92,74,66,0.06)] md:block md:max-w-xl md:space-y-4 md:p-5"
    >
      {error ? (
        <div className="col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <div className="col-span-2">
        <label className="mb-1.5 block text-sm font-semibold text-ink">Name</label>
        <input
          value={form.name}
          onChange={(event) => handleChange("name", event.target.value)}
          placeholder="Party dresses"
          className={fieldClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink">Slug</label>
        <input
          value={form.slug}
          onChange={(event) => handleChange("slug", event.target.value)}
          placeholder="party-dresses"
          className={fieldClass}
        />
        <p className="mt-1 text-xs text-muted">Leave empty to generate from name.</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink">Parent Category</label>
        <select
          value={form.parentId}
          onChange={(event) => handleChange("parentId", event.target.value)}
          className={fieldClass}
        >
          <option value="">Top Level</option>
          {parentOptions.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink">Sort Order</label>
        <input
          type="number"
          value={form.sortOrder}
          onChange={(event) => handleChange("sortOrder", Number(event.target.value))}
          className={fieldClass}
        />
      </div>

      <div className="col-span-2 rounded-xl bg-espresso p-4">
        <p className="mb-3 text-sm font-bold text-ink">Image</p>
        <ImageUploader
          folder="/dresses/categories"
          onUpload={(uploaded) => {
            const image = uploaded[0];
            if (!image) return;
            setForm((previous) => ({
              ...previous,
              imageFileId: image.fileId,
              imageUrl: image.url,
              imagePath: image.filePath,
            }));
          }}
        />
        {form.imageUrl ? (
          <img src={form.imageUrl} alt="" className="mt-3 h-24 w-full rounded-xl object-cover" />
        ) : null}
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-1">
          <input
            value={form.imageUrl}
            onChange={(event) => handleChange("imageUrl", event.target.value)}
            placeholder="Image URL"
            className={`${fieldClass} col-span-2 md:col-span-1`}
          />
          <input
            value={form.imageFileId}
            onChange={(event) => handleChange("imageFileId", event.target.value)}
            placeholder="ImageKit File ID"
            className={fieldClass}
          />
          <input
            value={form.imagePath}
            onChange={(event) => handleChange("imagePath", event.target.value)}
            placeholder="/dresses/categories/..."
            className={fieldClass}
          />
        </div>
      </div>

      <div className="col-span-2 rounded-xl bg-espresso p-4">
        <p className="mb-3 text-sm font-bold text-ink">Video</p>
        <ImageUploader
          folder="/dresses/categories"
          kind="video"
          onUpload={(uploaded) => {
            const video = uploaded[0];
            if (!video) return;
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
            className="mt-3 h-36 w-full rounded-xl bg-black object-contain"
          />
        ) : null}
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-1">
          <input
            value={form.videoUrl}
            onChange={(event) => handleChange("videoUrl", event.target.value)}
            placeholder="Video URL"
            className={`${fieldClass} col-span-2 md:col-span-1`}
          />
          <input
            value={form.videoFileId}
            onChange={(event) => handleChange("videoFileId", event.target.value)}
            placeholder="ImageKit File ID"
            className={fieldClass}
          />
          <input
            value={form.videoPath}
            onChange={(event) => handleChange("videoPath", event.target.value)}
            placeholder="/dresses/categories/..."
            className={fieldClass}
          />
        </div>
      </div>

      <label className="col-span-2 flex cursor-pointer items-center justify-between rounded-xl border border-line px-4 py-3">
        <div>
          <p className="text-sm font-bold text-ink">Show on Home</p>
          <p className="text-xs text-muted">Display this category on homepage.</p>
        </div>
        <input
          type="checkbox"
          checked={form.showOnHome}
          onChange={(event) => handleChange("showOnHome", event.target.checked)}
          className="h-5 w-5 accent-[var(--theme-accent)]"
        />
      </label>

      <label className="col-span-2 flex cursor-pointer items-center justify-between rounded-xl border border-line px-4 py-3">
        <div>
          <p className="text-sm font-bold text-ink">Active</p>
          <p className="text-xs text-muted">Inactive categories are hidden publicly.</p>
        </div>
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(event) => handleChange("isActive", event.target.checked)}
          className="h-5 w-5 accent-[var(--theme-accent)]"
        />
      </label>

      <div className="col-span-2 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blush px-5 py-3 font-bold text-[var(--theme-on-accent)] transition hover:bg-blush-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : categoryId ? "Update Category" : "Create Category"}
        </button>
        <Link
          href="/admin/categories"
          className="rounded-xl border border-line px-5 py-3 text-sm font-bold text-ink hover:bg-espresso"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
