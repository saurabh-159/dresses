"use client";

import Link from "next/link";
import type { AttributeType } from "@/components/admin/AttributeForm";

export type AttributeRow = {
  id: string;
  name: string;
  slug: string;
  type: AttributeType;
  values: string[];
  sortOrder: number;
  isActive: boolean;
};

const TYPE_LABEL: Record<AttributeType, string> = {
  select: "Select",
  color: "Colour swatch",
  text: "Text",
};

type AttributeTableProps = {
  attributes: AttributeRow[];
  loading: boolean;
  onDelete: (attribute: AttributeRow) => void;
};

export default function AttributeTable({ attributes, loading, onDelete }: AttributeTableProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_30px_rgba(92,74,66,0.06)]">
      <div className="border-b border-line px-5 py-5">
        <h2 className="text-lg font-extrabold text-ink">Attributes</h2>
        <p className="mt-1 text-sm text-muted">{attributes.length} attributes</p>
      </div>

      {loading ? (
        <div className="p-10 text-center text-sm text-muted">Loading attributes...</div>
      ) : attributes.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted">No attributes yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-line bg-espresso text-left">
                {["Attribute", "Type", "Values", "Status", "Actions"].map((heading) => (
                  <th key={heading} className="px-5 py-3 text-xs font-bold uppercase text-muted">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attributes.map((attribute) => (
                <tr key={attribute.id} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-4">
                    <p className="font-bold text-ink">{attribute.name}</p>
                    <p className="mt-1 text-xs text-muted">/{attribute.slug}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-ink">
                    {TYPE_LABEL[attribute.type] || "Select"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex max-w-md flex-wrap gap-1.5">
                      {attribute.values.slice(0, 6).map((value) => (
                        <span
                          key={value}
                          className="rounded-md border border-line bg-espresso px-2 py-0.5 text-xs text-ink"
                        >
                          {value}
                        </span>
                      ))}
                      {attribute.values.length > 6 ? (
                        <span className="px-1 text-xs text-muted">
                          +{attribute.values.length - 6}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {attribute.isActive ? (
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
                      <Link
                        href={`/admin/attributes/${attribute.id}/edit`}
                        className="text-sm font-bold text-[var(--theme-accent-dark)] hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(attribute)}
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
  );
}
