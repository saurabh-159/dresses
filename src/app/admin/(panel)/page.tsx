import Link from "next/link";
import {
  getAdminDashboardStats,
  getRecentAdminProducts,
} from "@/lib/db/queries";

export default async function AdminDashboardPage() {
  const [stats, recentProducts] = await Promise.all([
    getAdminDashboardStats(),
    getRecentAdminProducts(8),
  ]);

  const statCards = [
    {
      label: "Categories",
      value: stats.categories,
      href: "/admin/categories",
    },
    {
      label: "Products",
      value: stats.products,
      href: "/admin/products",
    },
    {
      label: "Active Sliders",
      value: stats.activeSliders,
      href: "/admin/sliders",
    },
    {
      label: "Featured Products",
      value: stats.featuredProducts,
      href: "/admin/products",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-line bg-white p-4 shadow-[0_8px_30px_rgba(0,65,140,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(0,65,140,0.1)] sm:p-5"
          >
            <p className="text-sm font-semibold text-muted">
              {card.label}
            </p>

            <p className="mt-2 text-2xl font-extrabold text-[var(--theme-accent-dark)] sm:mt-3 sm:text-3xl">
              {card.value}
            </p>

            <p className="mt-2 text-xs font-semibold text-muted">
              Manage →
            </p>
          </Link>
        ))}
      </section>

      {/* Recent Products */}
      <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_30px_rgba(92,74,66,0.06)]">
        <div className="flex flex-col gap-3 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-ink">
              Recent Products
            </h2>

            <p className="mt-1 text-sm text-muted">
              Latest clothes added to the store.
            </p>
          </div>

          <Link
            href="/admin/products"
            className="text-sm font-bold text-[var(--theme-accent-dark)] hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-line bg-espresso text-left">
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                  Product
                </th>

                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                  Category
                </th>

                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                  Price
                </th>

                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                  Featured
                </th>

                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {recentProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-line last:border-b-0"
                >
                  <td className="px-5 py-4">
                    <p className="font-bold text-ink">
                      {product.name}
                    </p>

                    <p className="mt-1 text-xs text-muted">
                      {product.slug}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-muted">
                    {product.category?.name || "—"}
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-ink">
                    {product.priceText}
                  </td>

                  <td className="px-5 py-4">
                    {product.isFeatured ? (
                      <span className="inline-flex rounded-full bg-[color-mix(in_srgb,var(--theme-highlight)_40%,white)] px-3 py-1 text-xs font-bold text-ink">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-espresso px-3 py-1 text-xs font-bold text-muted">
                        No
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-sm font-bold text-[var(--theme-accent-dark)] hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}

              {recentProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-muted"
                  >
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}