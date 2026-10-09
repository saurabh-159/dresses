"use client";

import Link from "next/link";

export type ProductRow = {
  id: string;
  name: string;
  sku: string;
  priceText: string;
  isFeatured: boolean;
  isActive: boolean;
  category: { name: string } | null;
  images: unknown[];
  videos?: unknown[];
};

type ProductTableProps = {
  products: ProductRow[];
  loading: boolean;
  onDelete: (product: ProductRow) => void;
};

export default function ProductTable({ products, loading, onDelete }: ProductTableProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_30px_rgba(92,74,66,0.06)]">
      <div className="border-b border-line px-5 py-5">
        <h2 className="text-lg font-extrabold text-ink">Products</h2>
        <p className="mt-1 text-sm text-muted">{products.length} products loaded</p>
      </div>

      {loading ? (
        <div className="p-10 text-center text-sm text-muted">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted">No products found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px]">
            <thead>
              <tr className="border-b border-line bg-espresso text-left">
                {["Product", "Category", "Price", "Featured", "Status", "Media", "Actions"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3 text-xs font-bold uppercase text-muted"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-4">
                    <p className="font-bold text-ink">{product.name}</p>
                    <p className="mt-1 text-xs text-muted">{product.sku}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted">
                    {product.category?.name || "—"}
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-ink">{product.priceText}</td>
                  <td className="px-5 py-4">
                    {product.isFeatured ? (
                      <span className="rounded-full bg-[color-mix(in_srgb,var(--theme-highlight)_40%,white)] px-3 py-1 text-xs font-bold text-ink">
                        Yes
                      </span>
                    ) : (
                      <span className="text-sm text-muted">No</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {product.isActive ? (
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-muted">
                    {product.images.length} photos
                    {(product.videos || []).length ? ` · ${product.videos?.length} videos` : ""}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-4">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-sm font-bold text-[var(--theme-accent-dark)] hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(product)}
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
