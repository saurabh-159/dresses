"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProductTable, { type ProductRow } from "@/components/admin/ProductTable";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts(nextSearch?: string, nextCategory?: string) {
    const query = nextSearch ?? search;
    const category = nextCategory ?? categoryFilter;

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (query.trim()) {
        params.set("q", query.trim());
      }

      if (category) {
        params.set("category", category);
      }

      params.set("page", "1");
      params.set("pageSize", "48");

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load products");
      }

      setProducts(data.items || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch("/api/categories")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(() => setCategories([]));

    loadProducts();
  }, []);

  async function handleDelete(product: ProductRow) {
    const confirmed = window.confirm(`Delete "${product.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`/api/products/id/${product.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete product");
      }

      await loadProducts();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete product");
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        description="Manage catalog items, photos, and pricing."
        action={{ href: "/admin/products/create", label: "+ Add product" }}
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-2xl border border-line bg-white p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-3 md:flex">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                loadProducts();
              }
            }}
            placeholder="Search products..."
            className="col-span-2 min-w-0 rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-[var(--theme-accent)] sm:px-4 sm:py-3 md:flex-1"
          />
          <select
            value={categoryFilter}
            onChange={(event) => {
              const value = event.target.value;
              setCategoryFilter(value);
              loadProducts(search, value);
            }}
            className="min-w-0 rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--theme-accent)] sm:px-4 sm:py-3"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => loadProducts()}
            className="rounded-xl bg-blush px-4 py-2.5 text-sm font-bold text-[var(--theme-on-accent)] hover:bg-blush-dark sm:px-5 sm:py-3"
          >
            Search
          </button>
        </div>
      </section>

      <ProductTable products={products} loading={loading} onDelete={handleDelete} />
    </div>
  );
}
