"use client";

import Link from "next/link";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  showOnHome: boolean;
  isActive: boolean;
};

type CategoryTableProps = {
  categories: CategoryRow[];
  loading: boolean;
  onDelete: (category: CategoryRow) => void;
};

export default function CategoryTable({ categories, loading, onDelete }: CategoryTableProps) {
  function parentName(parentId: string | null) {
    if (!parentId) {
      return "Top Level";
    }

    return categories.find((category) => category.id === parentId)?.name || "Unknown";
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_30px_rgba(92,74,66,0.06)]">
      <div className="border-b border-line px-5 py-5">
        <h2 className="text-lg font-extrabold text-ink">All Categories</h2>
        <p className="mt-1 text-sm text-muted">{categories.length} categories</p>
      </div>

      {loading ? (
        <div className="p-10 text-center text-sm text-muted">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted">No categories found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-line bg-espresso text-left">
                {["Category", "Parent", "Home", "Status", "Actions"].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-4">
                    <p className="font-bold text-ink">{category.name}</p>
                    <p className="mt-1 text-xs text-muted">/{category.slug}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted">{parentName(category.parentId)}</td>
                  <td className="px-5 py-4">
                    {category.showOnHome ? (
                      <span className="rounded-full bg-[color-mix(in_srgb,var(--theme-highlight)_40%,white)] px-3 py-1 text-xs font-bold text-ink">
                        Yes
                      </span>
                    ) : (
                      <span className="text-sm text-muted">No</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {category.isActive ? (
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
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/categories/${category.id}/edit`}
                        className="text-sm font-bold text-[var(--theme-accent-dark)] hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(category)}
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
