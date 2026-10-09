import { NextRequest, NextResponse } from "next/server";

import Product from "@/lib/db/models/Product";
import Category from "@/lib/db/models/Category";
import connectDB from "@/lib/db/mongoose";
import { getSession } from "@/lib/auth";

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { slug } = await params;

    await connectDB();

    const session = await getSession();

    const preview =
      request.nextUrl.searchParams.get("preview") === "1";

    const filter: any = {
      slug,
    };

    if (!session || !preview) {
      filter.isActive = true;
    }

    const product = await Product.findOne(filter)
      .populate("category", "name slug parent")
      .lean();

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const category: any = product.category;

    let parent = null;

    if (category?.parent) {
      const parentCategory = await Category.findById(category.parent)
        .select("name slug")
        .lean();

      if (parentCategory) {
        parent = {
          id: String(parentCategory._id),
          name: parentCategory.name,
          slug: parentCategory.slug,
        };
      }
    }

    const related = await Product.find({
      category: category?._id,
      _id: {
        $ne: product._id,
      },
      isActive: true,
    })
      .sort({
        sortOrder: 1,
        createdAt: -1,
      })
      .limit(8)
      .lean();

    return NextResponse.json({
      id: String(product._id),
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      priceText: product.priceText,
      minQty: product.minQty,
      description: product.description,
      sizes: product.sizes || "",
      fabric: product.fabric || "",
      color: product.color || "",
      isFeatured: product.isFeatured,
      sortOrder: product.sortOrder,
      isActive: product.isActive,

      category: category
        ? {
            id: String(category._id),
            name: category.name,
            slug: category.slug,
            parent,
          }
        : null,

      images: (product.images || [])
        .sort(
          (a: any, b: any) =>
            a.sortOrder - b.sortOrder
        ),

      videos: (product.videos || [])
        .sort(
          (a: any, b: any) =>
            a.sortOrder - b.sortOrder
        ),

      variants: (product.variants || []).map((variant: any) => ({
        priceText: variant.priceText || "",
        options: (variant.options || []).map((option: any) => ({
          attributeId: option.attributeId,
          name: option.name,
          slug: option.slug || "",
          type: option.type === "color" || option.type === "text" ? option.type : "select",
          value: option.value,
        })),
      })),

      related: related.map((item: any) => ({
        id: String(item._id),
        name: item.name,
        slug: item.slug,
        priceText: item.priceText,
        images: item.images || [],
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load product" },
      { status: 500 }
    );
  }
}