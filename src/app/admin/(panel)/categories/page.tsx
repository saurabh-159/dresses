"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import CategoryTable, { type CategoryRow } from "@/components/admin/CategoryTable";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/categories");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load categories");
      }

      setCategories(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleDelete(category: CategoryRow) {
    const confirmed = window.confirm(`Delete "${category.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`/api/categories/${category.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete category");
      }

      await loadCategories();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete category");
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categories"
        description="Organize the storefront into collections."
        action={{ href: "/admin/categories/create", label: "+ Add category" }}
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <CategoryTable categories={categories} loading={loading} onDelete={handleDelete} />
    </div>
  );
}
