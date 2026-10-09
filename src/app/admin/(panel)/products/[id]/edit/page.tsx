"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProductForm, { type ProductDraft } from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [product, setProduct] = useState<(ProductDraft & { name: string }) | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/products/id/${id}`)
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Product not found");
        }

        if (cancelled) {
          return;
        }

        setProduct({
          name: data.name || "",
          slug: data.slug || "",
          sku: data.sku || "",
          categoryId: data.category?.id || "",
          priceText: data.priceText || "",
          minQty: data.minQty || 1,
          description: data.description || "",
          sizes: data.sizes || "",
          fabric: data.fabric || "",
          color: data.color || "",
          isFeatured: Boolean(data.isFeatured),
          sortOrder: data.sortOrder || 0,
          isActive: data.isActive !== false,
          images: data.images || [],
          videos: data.videos || [],
          variants: data.variants || [],
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
    return <p className="text-sm text-muted">Product not found.</p>;
  }

  if (!product) {
    return <p className="text-sm text-muted">Loading product...</p>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Edit product"
        description={`Update details and attribute combinations for “${product.name}”.`}
      />
      <ProductForm key={id} productId={id} initial={product} />
    </div>
  );
}
