import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import Category from "@/lib/db/models/Category";
import { getCategoryTree } from "@/lib/db/queries";
import connectDB from "@/lib/db/mongoose";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/slug";

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  parentId: z.string().nullable().optional(),
  imageFileId: z.string().optional(),
  imageUrl: z.string().optional(),
  imagePath: z.string().optional(),
  videoFileId: z.string().optional(),
  videoUrl: z.string().optional(),
  videoPath: z.string().optional(),
  showOnHome: z.boolean().default(false),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const tree = request.nextUrl.searchParams.get("tree");

    if (tree === "1") {
      const categories = await getCategoryTree();
      return NextResponse.json(categories);
    }

    const session = await getSession();

    await connectDB();

    const filter = session ? {} : { isActive: true };

    const categories = await Category.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    const items = categories.map((category: any) => ({
      id: String(category._id),
      name: category.name,
      slug: category.slug,
      parentId: category.parent
        ? String(category.parent)
        : null,
      imageFileId: category.imageFileId || "",
      imageUrl: category.imageUrl || "",
      imagePath: category.imagePath || "",
      videoFileId: category.videoFileId || "",
      videoUrl: category.videoUrl || "",
      videoPath: category.videoPath || "",
      showOnHome: category.showOnHome,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    }));

    return NextResponse.json(items);
  } catch {
    return NextResponse.json(
      { error: "Failed to load categories" },
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
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid category data" },
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

    const existing = await Category.findOne({ slug });

    if (existing) {
      return NextResponse.json(
        { error: "Category slug already exists" },
        { status: 409 }
      );
    }

    const category = await Category.create({
      name: data.name,
      slug,
      parent: data.parentId || null,
      imageFileId: data.imageFileId || "",
      imageUrl: data.imageUrl || "",
      imagePath: data.imagePath || "",
      videoFileId: data.videoFileId || "",
      videoUrl: data.videoUrl || "",
      videoPath: data.videoPath || "",
      showOnHome: data.showOnHome,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    });

    return NextResponse.json(
      {
        id: String(category._id),
        name: category.name,
        slug: category.slug,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}