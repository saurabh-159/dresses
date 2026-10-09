"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUpload";
import VariantEditor, {
  type AttributeChoice,
  type ProductVariant,
} from "@/components/admin/VariantEditor";

type Category = {
  id: string;
  name: string;
};

export type ProductImage = {
  fileId: string;
  url: string;
  filePath: string;
  sortOrder: number;
};

export type ProductDraft = {
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  priceText: string;
  minQty: number;
  description: string;
  sizes: string;
  fabric: string;
  color: string;
  isFeatured: boolean;
  sortOrder: number;
  isActive: boolean;
  images: ProductImage[];
  videos: ProductImage[];
  variants: ProductVariant[];
};

const emptyDraft: ProductDraft = {
  name: "",
  slug: "",
  sku: "",
  categoryId: "",
  priceText: "",
  minQty: 1,
  description: "",
  sizes: "",
  fabric: "",
  color: "",
  isFeatured: false,
  sortOrder: 0,
  isActive: true,
  images: [],
  videos: [],
  variants: [],
};

const fieldClass =
  "w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-[var(--theme-accent)] sm:px-4 sm:py-3";

type ProductFormProps = {
  productId?: string;
  initial?: ProductDraft;
};

export default function ProductForm({ productId, initial }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<AttributeChoice[]>([]);
  const [form, setForm] = useState<ProductDraft>(initial || emptyDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(
            data.map((item: Category) => ({
              id: item.id,
              name: item.name,
            }))
          );
        }
      })
      .catch(() => setCategories([]));

    fetch("/api/attributes")
      .then((response) => response.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          return;
        }

        setAttributes(
          (data as (AttributeChoice & { isActive?: boolean })[])
            .filter((item) => item.isActive !== false && item.values?.length)
            .map((item) => ({
              id: item.id,
              name: item.name,
              slug: item.slug || "",
              type: item.type === "color" || item.type === "text" ? item.type : "select",
              values: item.values,
            }))
        );
      })
      .catch(() => setAttributes([]));
  }, []);

  function handleChange<K extends keyof ProductDraft>(field: K, value: ProductDraft[K]) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.categoryId) {
      setError("Please select a category.");
      return;
    }

    if (!form.priceText.trim()) {
      setError("Price text is required.");
      return;
    }

    if (form.variants.some((variant) => !variant.priceText.trim())) {
      setError("Enter a price for every attribute combination.");
      return;
    }

    const attributeIds = new Set(
      form.variants.flatMap((variant) => variant.options.map((option) => option.attributeId))
    );

    if (
      [...attributeIds].some((id) =>
        form.variants.some((variant) => !variant.options.some((option) => option.attributeId === id))
      )
    ) {
      setError("Some combinations are missing an attribute you added. Remove those rows and add them again.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(productId ? `/api/products/id/${productId}` : "/api/products", {
        method: productId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          minQty: Number(form.minQty) || 1,
          sortOrder: Number(form.sortOrder),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save product");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  function addImage() {
    setForm((previous) => ({
      ...previous,
      images: [
        ...previous.images,
        { fileId: "", url: "", filePath: "", sortOrder: previous.images.length },
      ],
    }));
  }

  function updateImage(index: number, field: keyof ProductImage, value: string | number) {
    setForm((previous) => {
      const images = [...previous.images];
      images[index] = { ...images[index], [field]: value };
      return { ...previous, images };
    });
  }

  function removeImage(index: number) {
    setForm((previous) => ({
      ...previous,
      images: previous.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  }

  function addVideo() {
    setForm((previous) => ({
      ...previous,
      videos: [
        ...previous.videos,
        { fileId: "", url: "", filePath: "", sortOrder: previous.videos.length },
      ],
    }));
  }

  function updateVideo(index: number, field: keyof ProductImage, value: string | number) {
    setForm((previous) => {
      const videos = [...previous.videos];
      videos[index] = { ...videos[index], [field]: value };
      return { ...previous, videos };
    });
  }

  function removeVideo(index: number) {
    setForm((previous) => ({
      ...previous,
      videos: previous.videos.filter((_, videoIndex) => videoIndex !== index),
    }));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 gap-3 rounded-2xl border border-line bg-white p-4 shadow-[0_8px_30px_rgba(92,74,66,0.06)] sm:gap-5 sm:p-5"
    >
      {error ? (
        <div className="col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <div className="col-span-2 lg:col-span-1">
        <label className="mb-1.5 block text-sm font-semibold">Product Name</label>
        <input
          value={form.name}
          onChange={(event) => handleChange("name", event.target.value)}
          placeholder="Floral midi dress"
          className={fieldClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold">SKU</label>
        <input
          value={form.sku}
          onChange={(event) => handleChange("sku", event.target.value)}
          placeholder="DRS-101"
          className={fieldClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold">Slug</label>
        <input
          value={form.slug}
          onChange={(event) => handleChange("slug", event.target.value)}
          placeholder="floral-midi-dress"
          className={fieldClass}
        />
      </div>

      <div className="col-span-2 lg:col-span-1">
        <label className="mb-1.5 block text-sm font-semibold">Category</label>
        <select
          value={form.categoryId}
          onChange={(event) => handleChange("categoryId", event.target.value)}
          className={`${fieldClass} bg-white`}
        >
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold">Price Text</label>
        <input
          value={form.priceText}
          onChange={(event) => handleChange("priceText", event.target.value)}
          placeholder="₹2,499"
          className={fieldClass}
        />
        <p className="mt-1 text-xs text-muted">
          Shown on listings. Each attribute combination below can show its own price on the product page.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold">Minimum Quantity</label>
        <input
          type="number"
          min="1"
          value={form.minQty}
          onChange={(event) => handleChange("minQty", Number(event.target.value))}
          className={fieldClass}
        />
      </div>

      <div className="col-span-2">
        <label className="mb-1.5 block text-sm font-semibold">Description</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(event) => handleChange("description", event.target.value)}
          placeholder="Fit, length, lining and care notes"
          className={`${fieldClass} resize-none`}
        />
      </div>

      <VariantEditor
        attributes={attributes}
        initialVariants={form.variants}
        onChange={(variants) => handleChange("variants", variants)}
      />

      <div className="col-span-2 rounded-xl bg-espresso p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-bold text-ink">Product Images</p>
            <p className="text-xs text-muted">Multiple images are supported.</p>
          </div>
          <div className="flex items-center gap-2">
            <ImageUploader
              folder="/dresses/products"
              multiple
              onUpload={(uploaded) => {
                setForm((previous) => ({
                  ...previous,
                  images: [
                    ...previous.images,
                    ...uploaded.map((image, index) => ({
                      fileId: image.fileId,
                      url: image.url,
                      filePath: image.filePath,
                      sortOrder: previous.images.length + index,
                    })),
                  ],
                }));
              }}
            />
            <button
              type="button"
              onClick={addImage}
              className="rounded-lg border border-[var(--theme-accent)] px-4 py-2 text-xs font-bold text-[var(--theme-accent-dark)]"
            >
              Add URL
            </button>
          </div>
        </div>

        <p className="mb-4 rounded-lg border border-line bg-white px-3 py-2.5 text-xs leading-relaxed text-ink">
          Upload each photo at <span className="font-bold">720 × 960 px</span>, portrait 3:4.
          That size fills the product photo frame with no empty space around it.
          A larger file of the same shape, such as 1080 × 1440 px, is fine.
        </p>

        {form.images.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line px-5 py-8 text-center text-sm text-muted">
            No images added yet.
          </div>
        ) : (
          <div className="space-y-3">
            {form.images.map((image, index) => (
              <div
                key={`${image.fileId}-${index}`}
                className="grid grid-cols-2 gap-3 rounded-xl border border-line bg-white p-3 sm:p-4 md:grid-cols-[1fr_1fr_120px_auto]"
              >
                <input
                  value={image.url}
                  onChange={(event) => updateImage(index, "url", event.target.value)}
                  placeholder="Image URL"
                  className="col-span-2 min-w-0 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-[var(--theme-accent)] md:col-span-1"
                />
                <input
                  value={image.fileId}
                  onChange={(event) => updateImage(index, "fileId", event.target.value)}
                  placeholder="ImageKit File ID"
                  className="col-span-2 min-w-0 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-[var(--theme-accent)] md:col-span-1"
                />
                <input
                  type="number"
                  value={image.sortOrder}
                  onChange={(event) => updateImage(index, "sortOrder", Number(event.target.value))}
                  placeholder="Order"
                  className="min-w-0 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-[var(--theme-accent)]"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="rounded-lg px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
                <input
                  value={image.filePath}
                  onChange={(event) => updateImage(index, "filePath", event.target.value)}
                  placeholder="/dresses/products/image.jpg"
                  className="col-span-2 min-w-0 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-[var(--theme-accent)] md:col-span-3"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="col-span-2 rounded-xl bg-espresso p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-bold text-ink">Product Videos</p>
            <p className="text-xs text-muted">Videos appear in the product gallery with the photos.</p>
          </div>
          <div className="flex items-center gap-2">
            <ImageUploader
              folder="/dresses/products"
              kind="video"
              multiple
              onUpload={(uploaded) => {
                setForm((previous) => ({
                  ...previous,
                  videos: [
                    ...previous.videos,
                    ...uploaded.map((video, index) => ({
                      fileId: video.fileId,
                      url: video.url,
                      filePath: video.filePath,
                      sortOrder: previous.videos.length + index,
                    })),
                  ],
                }));
              }}
            />
            <button
              type="button"
              onClick={addVideo}
              className="rounded-lg border border-[var(--theme-accent)] px-4 py-2 text-xs font-bold text-[var(--theme-accent-dark)]"
            >
              Add URL
            </button>
          </div>
        </div>

        {form.videos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line px-5 py-8 text-center text-sm text-muted">
            No videos added yet.
          </div>
        ) : (
          <div className="space-y-3">
            {form.videos.map((video, index) => (
              <div
                key={`${video.fileId}-${index}`}
                className="grid grid-cols-2 gap-3 rounded-xl border border-line bg-white p-3 sm:p-4 md:grid-cols-[1fr_1fr_120px_auto]"
              >
                <input
                  value={video.url}
                  onChange={(event) => updateVideo(index, "url", event.target.value)}
                  placeholder="Video URL"
                  className="col-span-2 min-w-0 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-[var(--theme-accent)] md:col-span-1"
                />
                <input
                  value={video.fileId}
                  onChange={(event) => updateVideo(index, "fileId", event.target.value)}
                  placeholder="ImageKit File ID"
                  className="col-span-2 min-w-0 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-[var(--theme-accent)] md:col-span-1"
                />
                <input
                  type="number"
                  value={video.sortOrder}
                  onChange={(event) => updateVideo(index, "sortOrder", Number(event.target.value))}
                  placeholder="Order"
                  className="min-w-0 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-[var(--theme-accent)]"
                />
                <button
                  type="button"
                  onClick={() => removeVideo(index)}
                  className="rounded-lg px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
                {video.url ? (
                  <video
                    src={video.url}
                    controls
                    className="col-span-2 h-28 w-full rounded-lg bg-black object-contain md:col-span-4"
                  />
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="col-span-2 flex flex-wrap gap-3 sm:gap-4">
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-4 py-3">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(event) => handleChange("isFeatured", event.target.checked)}
            className="h-5 w-5 accent-[var(--theme-accent)]"
          />
          <span className="text-sm font-bold">Featured Product</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-4 py-3">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => handleChange("isActive", event.target.checked)}
            className="h-5 w-5 accent-[var(--theme-accent)]"
          />
          <span className="text-sm font-bold">Active</span>
        </label>
      </div>

      <div className="col-span-2 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blush px-5 py-3 font-bold text-[var(--theme-on-accent)] transition hover:bg-blush-dark disabled:opacity-60"
        >
          {saving ? "Saving..." : productId ? "Update Product" : "Create Product"}
        </button>
        <Link
          href="/admin/products"
          className="rounded-xl border border-line px-5 py-3 text-sm font-bold text-ink hover:bg-espresso"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
