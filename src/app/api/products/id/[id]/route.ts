import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db/mongoose";
import Product from "@/lib/db/models/Product";
import Category from "@/lib/db/models/Category";
import { getSession } from "@/lib/auth";
import { deleteImageKitFiles } from "@/lib/imagekit/delete";
import { slugify } from "@/lib/slug";

const imageSchema = z.object({
  fileId: z.string().default(""),
  url: z.string().min(1),
  filePath: z.string().default(""),
  sortOrder: z.number().default(0),
});

const variantOptionSchema = z.object({
  attributeId: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().default(""),
  type: z.enum(["select", "color", "text"]).default("select"),
  value: z.string().min(1),
});

const variantSchema = z.object({
  options: z.array(variantOptionSchema).default([]),
  priceText: z.string().default(""),
});

const updateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  sku: z.string().min(1),
  categoryId: z.string().min(1),
  priceText: z.string().min(1),
  minQty: z.number().min(1).default(1),
  description: z.string().default(""),
  sizes: z.string().default(""),
  fabric: z.string().default(""),
  color: z.string().default(""),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  images: z.array(imageSchema).default([]),
  videos: z.array(imageSchema).default([]),
  variants: z.array(variantSchema).default([]),
});

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    await connectDB();

    const product = await Product.findById(id)
      .populate("category", "name slug")
      .lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const category = product.category as {
      _id?: unknown;
      name?: string;
      slug?: string;
    } | null;

    return NextResponse.json({
      id: String(product._id),
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      priceText: product.priceText,
      minQty: product.minQty || 1,
      description: product.description || "",
      sizes: product.sizes || "",
      fabric: product.fabric || "",
      color: product.color || "",
      isFeatured: product.isFeatured,
      sortOrder: product.sortOrder,
      isActive: product.isActive,
      category: category?._id
        ? {
            id: String(category._id),
            name: category.name,
            slug: category.slug,
          }
        : null,
      images: [...(product.images || [])].sort(
        (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
      ),
      videos: [...(product.videos || [])].sort(
        (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
      ),
      variants: (product.variants || []).map((variant) => ({
        priceText: variant.priceText || "",
        options: (variant.options || []).map((option) => ({
          attributeId: option.attributeId,
          name: option.name,
          slug: option.slug || "",
          type:
            option.type === "color" || option.type === "text"
              ? option.type
              : "select",
          value: option.value,
        })),
      })),
    });
  } catch (error) {
    console.error("Load product error:", error);

    return NextResponse.json(
      { error: "Failed to load product" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
    }

    await connectDB();

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const data = parsed.data;
    const slug = slugify(data.slug || data.name);

    if (!slug) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const existing = await Product.findOne({
      slug,
      _id: { $ne: product._id },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Product slug already exists" },
        { status: 409 }
      );
    }

    const missingPrice = data.variants.some(
      (variant) => variant.options.length > 0 && !variant.priceText.trim()
    );

    if (missingPrice) {
      return NextResponse.json(
        { error: "Enter a price for every attribute combination" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(data.categoryId)) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }

    const category = await Category.findById(data.categoryId);

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }

    const nextImages = data.images.filter((image) => image.url);
    const nextVideos = data.videos.filter((video) => video.url);
    const nextFileIds = new Set([
      ...nextImages.map((image) => image.fileId),
      ...nextVideos.map((video) => video.fileId),
    ]);
    const removedFileIds = [...product.images, ...(product.videos || [])]
      .map((file) => file.fileId)
      .filter((fileId) => fileId && !nextFileIds.has(fileId));

    product.name = data.name;
    product.slug = slug;
    product.sku = data.sku;
    product.category = category._id;
    product.priceText = data.priceText;
    product.minQty = data.minQty;
    product.description = data.description;
    product.sizes = data.sizes;
    product.fabric = data.fabric;
    product.color = data.color;
    product.isFeatured = data.isFeatured;
    product.sortOrder = data.sortOrder;
    product.isActive = data.isActive;
    product.images = nextImages;
    product.videos = nextVideos;
    product.variants = data.variants.filter(
      (variant) => variant.priceText.trim() && variant.options.length > 0
    );

    await product.save();
    await deleteImageKitFiles(removedFileIds);

    return NextResponse.json({
      id: String(product._id),
      name: product.name,
      slug: product.slug,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { id } = await params;

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const fileIds = [...product.images, ...(product.videos || [])]
      .map((file) => file.fileId)
      .filter(Boolean);

    await deleteImageKitFiles(fileIds);
    await Product.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);

    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
