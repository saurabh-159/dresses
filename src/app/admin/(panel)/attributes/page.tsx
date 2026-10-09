"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AttributeTable, { type AttributeRow } from "@/components/admin/AttributeTable";

export default function AttributesPage() {
  const [attributes, setAttributes] = useState<AttributeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAttributes() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/attributes");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load attributes");
      }

      setAttributes(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load attributes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAttributes();
  }, []);

  async function handleDelete(attribute: AttributeRow) {
    const confirmed = window.confirm(`Delete "${attribute.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`/api/attributes/${attribute.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete attribute");
      }

      await loadAttributes();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete attribute");
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Attributes"
        description="Size, colour, fabric, and other options used on products."
        action={{ href: "/admin/attributes/create", label: "+ Add attribute" }}
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <AttributeTable attributes={attributes} loading={loading} onDelete={handleDelete} />
    </div>
  );
}
