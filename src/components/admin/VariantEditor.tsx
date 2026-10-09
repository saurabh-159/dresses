"use client";

import { useEffect, useMemo, useState } from "react";

export type AttributeChoice = {
  id: string;
  name: string;
  slug: string;
  type: "select" | "color" | "text";
  values: string[];
};

export type VariantOption = {
  attributeId: string;
  name: string;
  slug: string;
  type: "select" | "color" | "text";
  value: string;
};

export type ProductVariant = {
  options: VariantOption[];
  priceText: string;
};

type VariantEditorProps = {
  attributes: AttributeChoice[];
  initialVariants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
};

function combinationKey(options: VariantOption[]) {
  return [...options]
    .sort((a, b) => a.attributeId.localeCompare(b.attributeId))
    .map((option) => `${option.attributeId}:${option.value}`)
    .join("|");
}

function combinationLabel(options: VariantOption[]) {
  return options.map((option) => `${option.name} ${option.value}`).join(" · ");
}

function idsFromVariants(variants: ProductVariant[]) {
  const ids: string[] = [];

  for (const variant of variants) {
    for (const option of variant.options) {
      if (option.attributeId && !ids.includes(option.attributeId)) {
        ids.push(option.attributeId);
      }
    }
  }

  return ids;
}

export default function VariantEditor({
  attributes,
  initialVariants,
  onChange,
}: VariantEditorProps) {
  const catalog = useMemo(
    () => new Map(attributes.map((attribute) => [attribute.id, attribute])),
    [attributes]
  );
  const [rows, setRows] = useState<ProductVariant[]>(initialVariants);
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    idsFromVariants(initialVariants).filter((id) => catalog.has(id) || attributes.length === 0)
  );
  const [typeToAdd, setTypeToAdd] = useState("");
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [comboPrice, setComboPrice] = useState("");
  const [attrError, setAttrError] = useState("");

  function publish(next: ProductVariant[]) {
    setRows(next);
    onChange(next);
  }

  useEffect(() => {
    if (attributes.length === 0) {
      return;
    }

    setSelectedIds((current) => {
      const next = current.filter((id) => catalog.has(id));

      for (const id of idsFromVariants(rows)) {
        if (catalog.has(id) && !next.includes(id)) {
          next.push(id);
        }
      }

      if (next.length === current.length && next.every((id, index) => id === current[index])) {
        return current;
      }

      return next;
    });
  }, [attributes, catalog, rows]);

  const available = attributes.filter((attribute) => !selectedIds.includes(attribute.id));
  const activeIds = selectedIds.filter((id) => catalog.has(id));
  const incomplete = rows.some((row) =>
    activeIds.some((id) => !row.options.some((option) => option.attributeId === id))
  );

  function addAttributeType() {
    const id = typeToAdd || available[0]?.id;

    if (!id || selectedIds.includes(id)) {
      return;
    }

    const attribute = catalog.get(id);
    const nextIds = [...selectedIds, id];
    setSelectedIds(nextIds);
    setDraftValues((previous) => ({
      ...previous,
      [id]: previous[id] || attribute?.values[0] || "",
    }));
    setTypeToAdd("");
    setAttrError("");
  }

  function removeAttributeType(id: string) {
    setSelectedIds((previous) => previous.filter((item) => item !== id));
    setDraftValues((previous) => {
      const next = { ...previous };
      delete next[id];
      return next;
    });
    publish(
      rows
        .map((row) => ({
          ...row,
          options: row.options.filter((option) => option.attributeId !== id),
        }))
        .filter((row) => row.options.length > 0)
    );
    setAttrError("");
  }

  function addCombination() {
    if (activeIds.length === 0) {
      setAttrError("Choose at least one attribute first.");
      return;
    }

    if (!comboPrice.trim()) {
      setAttrError("Enter a price for this combination.");
      return;
    }

    const options = activeIds.map((id) => {
      const attribute = catalog.get(id);
      const value = draftValues[id] || attribute?.values[0] || "";

      return {
        attributeId: id,
        name: attribute?.name || "Attribute",
        slug: attribute?.slug || "",
        type: attribute?.type || "select",
        value,
      };
    });

    if (options.some((option) => !option.value)) {
      setAttrError("Choose a value for every attribute.");
      return;
    }

    if (rows.some((row) => combinationKey(row.options) === combinationKey(options))) {
      setAttrError("This combination is already added.");
      return;
    }

    publish([...rows, { options, priceText: comboPrice.trim() }]);
    setComboPrice("");
    setAttrError("");
  }

  return (
    <div className="col-span-2 rounded-xl bg-espresso p-4">
      <div className="mb-4">
        <p className="font-bold text-ink">Attributes</p>
        <p className="mt-1 text-xs text-muted">
          Add Size, Colour, or any other attribute, then save each combination with its own price.
          Example: Size L · Colour Red — ₹2,499.
        </p>
      </div>

      {attributes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-4 py-6 text-sm text-muted">
          No attributes yet. Create them in the Attributes section first.
        </p>
      ) : available.length > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Attribute
            </label>
            <select
              value={typeToAdd}
              onChange={(event) => {
                setTypeToAdd(event.target.value);
                setAttrError("");
              }}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-[var(--theme-accent)]"
            >
              <option value="">Select attribute</option>
              {available.map((attribute) => (
                <option key={attribute.id} value={attribute.id}>
                  {attribute.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={addAttributeType}
            className="rounded-xl border border-[var(--theme-accent)] bg-white px-4 py-3 text-sm font-bold text-[var(--theme-accent-dark)] hover:bg-blush hover:text-[var(--theme-on-accent)]"
          >
            Add attribute
          </button>
        </div>
      ) : (
        <p className="text-sm text-muted">All attributes are added.</p>
      )}

      {activeIds.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
          Add attributes such as Size and Colour, then build combinations.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {activeIds.map((id) => {
            const attribute = catalog.get(id);

            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-sm text-ink"
              >
                {attribute?.name || "Attribute"}
                <button
                  type="button"
                  onClick={() => removeAttributeType(id)}
                  className="rounded px-1 text-muted hover:bg-espresso hover:text-ink"
                  aria-label={`Remove ${attribute?.name || "attribute"}`}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      {activeIds.length > 0 ? (
        <div className="mt-4 space-y-4 rounded-xl border border-line bg-white p-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {activeIds.map((id) => {
              const attribute = catalog.get(id);
              const values = attribute?.values || [];

              return (
                <div key={id} className="min-w-0">
                  <label className="mb-1.5 block text-sm font-semibold text-ink">
                    {attribute?.name || "Attribute"}
                  </label>
                  <select
                    value={draftValues[id] || values[0] || ""}
                    onChange={(event) => {
                      setDraftValues((previous) => ({
                        ...previous,
                        [id]: event.target.value,
                      }));
                      setAttrError("");
                    }}
                    className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-[var(--theme-accent)]"
                  >
                    {values.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
            <div className="min-w-0">
              <label className="mb-1.5 block text-sm font-semibold text-ink">
                Price
              </label>
              <input
                value={comboPrice}
                onChange={(event) => {
                  setComboPrice(event.target.value);
                  setAttrError("");
                }}
                placeholder="₹2,499"
                className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-[var(--theme-accent)]"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={addCombination}
            className="rounded-xl border border-[var(--theme-accent)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--theme-accent-dark)] hover:bg-blush hover:text-[var(--theme-on-accent)]"
          >
            Add combination
          </button>
        </div>
      ) : null}

      {attrError ? <p className="mt-3 text-sm text-red-600">{attrError}</p> : null}
      {incomplete ? (
        <p className="mt-3 text-sm text-amber-700">
          Some combinations are missing an attribute you added. Remove those rows and add them again.
        </p>
      ) : null}

      {rows.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
          No combinations yet. Example: Size L · Colour Red — ₹2,499.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
          {rows.map((row, index) => (
            <li
              key={`${combinationKey(row.options)}-${index}`}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">
                  {combinationLabel(row.options)}
                </p>
                <p className="text-xs text-muted">{row.priceText}</p>
              </div>
              <button
                type="button"
                onClick={() => publish(rows.filter((_, rowIndex) => rowIndex !== index))}
                className="shrink-0 rounded-lg px-2 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-xs text-muted">
        Attribute options come from the Attributes section.
      </p>
    </div>
  );
}
