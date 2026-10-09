"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type AttributeType = "select" | "color" | "text";

export type AttributeDraft = {
  name: string;
  slug: string;
  type: AttributeType;
  values: string[];
  sortOrder: number;
  isActive: boolean;
};

const emptyDraft: AttributeDraft = {
  name: "",
  slug: "",
  type: "select",
  values: [],
  sortOrder: 0,
  isActive: true,
};

const fieldClass =
  "w-full min-w-0 rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-[var(--theme-accent)] sm:px-4 sm:py-3";

type AttributeFormProps = {
  attributeId?: string;
  initial?: AttributeDraft;
};

export default function AttributeForm({ attributeId, initial }: AttributeFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<AttributeDraft>(initial || emptyDraft);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function addValue() {
    const value = draft.trim();
    const key = value.toLowerCase();

    if (!value || form.values.some((item) => item.toLowerCase() === key)) {
      setDraft("");
      return;
    }

    setForm((previous) => ({
      ...previous,
      values: [...previous.values, value],
    }));
    setDraft("");
    setError("");
  }

  function removeValue(value: string) {
    setForm((previous) => ({
      ...previous,
      values: previous.values.filter((item) => item !== value),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Attribute name is required.");
      return;
    }

    if (form.values.length === 0) {
      setError("Add at least one value.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        attributeId ? `/api/attributes/${attributeId}` : "/api/attributes",
        {
          method: attributeId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            slug: form.slug,
            type: form.type,
            values: form.values,
            sortOrder: Number(form.sortOrder),
            isActive: form.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save attribute");
      }

      router.push("/admin/attributes");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save attribute");
    } finally {
      setSaving(false);
    }
  }

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

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink">Name</label>
        <input
          value={form.name}
          onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
          placeholder="Size"
          className={fieldClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink">Slug</label>
        <input
          value={form.slug}
          onChange={(event) => setForm((previous) => ({ ...previous, slug: event.target.value }))}
          placeholder="size"
          className={fieldClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink">Type</label>
        <select
          value={form.type}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              type: event.target.value as AttributeType,
            }))
          }
          className={`${fieldClass} bg-white`}
        >
          <option value="select">Select</option>
          <option value="color">Colour swatch</option>
          <option value="text">Text</option>
        </select>
        <p className="mt-1 text-xs text-muted">
          Colour swatch shows round colour dots on the product page.
        </p>
      </div>

      <div className="col-span-2">
        <label className="mb-1.5 block text-sm font-semibold text-ink">Values</label>
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addValue();
              }
            }}
            placeholder="e.g. XL"
            className="min-w-0 flex-1 rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-[var(--theme-accent)]"
          />
          <button
            type="button"
            onClick={addValue}
            className="rounded-xl border border-[var(--theme-accent)] px-4 py-3 text-sm font-bold text-[var(--theme-accent-dark)]"
          >
            Add
          </button>
        </div>
        {form.values.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
            No values yet. Add at least one option.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {form.values.map((value) => (
              <span
                key={value}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-espresso px-3 py-1.5 text-sm text-ink"
              >
                {value}
                <button
                  type="button"
                  onClick={() => removeValue(value)}
                  className="rounded px-1 text-muted hover:text-ink"
                  aria-label={`Remove ${value}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink">Sort Order</label>
        <input
          type="number"
          value={form.sortOrder}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              sortOrder: Number(event.target.value),
            }))
          }
          className={fieldClass}
        />
      </div>

      <label className="col-span-2 flex cursor-pointer items-center justify-between rounded-xl border border-line px-4 py-3">
        <span className="text-sm font-bold text-ink">Active</span>
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              isActive: event.target.checked,
            }))
          }
          className="h-5 w-5 accent-[var(--theme-accent)]"
        />
      </label>

      <div className="col-span-2 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blush px-5 py-3 font-bold text-[var(--theme-on-accent)] transition hover:bg-blush-dark disabled:opacity-60"
        >
          {saving ? "Saving..." : attributeId ? "Update Attribute" : "Create Attribute"}
        </button>
        <Link
          href="/admin/attributes"
          className="rounded-xl border border-line px-5 py-3 text-sm font-bold text-ink hover:bg-espresso"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
