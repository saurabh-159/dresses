"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import CategoryForm, { type CategoryDraft } from "@/components/admin/CategoryForm";

export default function EditCategoryPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [category, setCategory] = useState<CategoryDraft | null>(null);
  const [name, setName] = useState("");
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/categories/${id}`)
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Category not found");
        }

        if (cancelled) {
          return;
        }

        setName(data.name || "");
        setCategory({
          name: data.name || "",
          slug: data.slug || "",
          parentId: data.parent?.id || "",
          imageFileId: data.imageFileId || "",
          imageUrl: data.imageUrl || "",
          imagePath: data.imagePath || "",
          videoFileId: data.videoFileId || "",
          videoUrl: data.videoUrl || "",
          videoPath: data.videoPath || "",
          showOnHome: Boolean(data.showOnHome),
          sortOrder: data.sortOrder || 0,
          isActive: data.isActive !== false,
        });
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
    return <p className="text-sm text-muted">Category not found.</p>;
  }

  if (!category) {
    return <p className="text-sm text-muted">Loading category...</p>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Edit category"
        description={`Update “${name}” and where it appears.`}
      />
      <CategoryForm key={id} categoryId={id} initial={category} />
    </div>
  );
}
