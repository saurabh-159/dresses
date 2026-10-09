"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AttributeForm, { type AttributeDraft } from "@/components/admin/AttributeForm";

type AttributeRecord = AttributeDraft & { id: string };

export default function EditAttributePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [attribute, setAttribute] = useState<AttributeRecord | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/attributes")
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load attribute");
        }

        const found = (data as AttributeRecord[]).find((item) => item.id === id);

        if (!found) {
          if (!cancelled) {
            setMissing(true);
          }
          return;
        }

        if (!cancelled) {
          setAttribute(found);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMissing(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (missing) {
    return <p className="text-sm text-muted">Attribute not found.</p>;
  }

  if (!attribute) {
    return <p className="text-sm text-muted">Loading attribute...</p>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Edit attribute"
        description={`Update values for “${attribute.name}”.`}
      />
      <AttributeForm
        key={attribute.id}
        attributeId={attribute.id}
        initial={{
          name: attribute.name,
          slug: attribute.slug,
          type: attribute.type || "select",
          values: attribute.values || [],
          sortOrder: attribute.sortOrder || 0,
          isActive: attribute.isActive !== false,
        }}
      />
    </div>
  );
}
