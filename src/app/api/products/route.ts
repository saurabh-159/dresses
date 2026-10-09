import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import Product from "@/lib/db/models/Product";
import Category from "@/lib/db/models/Category";
import connectDB from "@/lib/db/mongoose";
import { getSession } from "@/lib/auth";
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

const productSchema = z.object({
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

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;

    const categorySlug = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("q") || "";

    const page = Math.max(
      1,
      Number(searchParams.get("page") || 1)
    );

    const pageSize = Math.min(
      48,
      Math.max(
        1,
        Number(searchParams.get("pageSize") || 24)
      )
    );

    const session = await getSession();

    const filter: any = {};

    if (!session) {
      filter.isActive = true;
    }

    if (featured === "1") {
      filter.isFeatured = true;
    }

    if (search.trim()) {
      filter.name = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    if (categorySlug) {
      const category = await Category.findOne({
        slug: categorySlug,
      }).lean();

      if (!category) {
        return NextResponse.json({
          items: [],
          total: 0,
          page,
          pageSize,
        });
      }

      filter.category = category._id;
    }

    const skip = (page - 1) * pageSize;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort({
          sortOrder: 1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(pageSize)
        .lean(),

      Product.countDocuments(filter),
    ]);

    const items = products.map((product: any) => ({
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

      category: product.category
        ? {
            id: String(product.category._id),
            name: product.category.name,
            slug: product.category.slug,
          }
        : null,

      images: (product.images || [])
        .sort(
          (a: any, b: any) =>
            a.sortOrder - b.sortOrder
        )
        .map((image: any) => ({
          fileId: image.fileId,
          url: image.url,
          filePath: image.filePath,
          sortOrder: image.sortOrder,
        })),

      videos: (product.videos || [])
        .sort(
          (a: any, b: any) =>
            a.sortOrder - b.sortOrder
        )
        .map((video: any) => ({
          fileId: video.fileId,
          url: video.url,
          filePath: video.filePath,
          sortOrder: video.sortOrder,
        })),
    }));

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid product data" },
        { status: 400 }
      );
    }

    await connectDB();

    const data = parsed.data;

    const slug = slugify(data.slug || data.name);

    if (!slug) {
      return NextResponse.json(
        { error: "Invalid slug" },
        { status: 400 }
      );
    }

    const existing = await Product.findOne({
      slug,
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

    const category = await Category.findById(
      data.categoryId
    );

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name: data.name,
      slug,
      sku: data.sku,
      category: category._id,
      priceText: data.priceText,
      minQty: data.minQty,
      description: data.description,
      sizes: data.sizes,
      fabric: data.fabric,
      color: data.color,
      isFeatured: data.isFeatured,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      images: data.images.filter((image) => image.url),
      videos: data.videos.filter((video) => video.url),
      variants: data.variants.filter(
        (variant) => variant.priceText.trim() && variant.options.length > 0
      ),
    });

    return NextResponse.json(
      {
        id: String(product._id),
        name: product.name,
        slug: product.slug,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}