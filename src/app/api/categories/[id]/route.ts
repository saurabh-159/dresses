import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";

import Category from "@/lib/db/models/Category";
import Product from "@/lib/db/models/Product";
import connectDB from "@/lib/db/mongoose";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { deleteImageKitFile } from "@/lib/imagekit/delete";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  parentId: z.string().nullable().optional(),
  imageFileId: z.string().optional(),
  imageUrl: z.string().optional(),
  imagePath: z.string().optional(),
  videoFileId: z.string().optional(),
  videoUrl: z.string().optional(),
  videoPath: z.string().optional(),
  showOnHome: z.boolean().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid category id" },
        { status: 400 }
      );
    }

    await connectDB();

    const category = await Category.findById(id).lean();

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const children = await Category.find({
      parent: category._id,
    })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    let parent = null;

    if (category.parent) {
      parent = await Category.findById(category.parent)
        .select("name slug")
        .lean();
    }

    return NextResponse.json({
      id: String(category._id),
      name: category.name,
      slug: category.slug,
      parent: parent
        ? {
            id: String(parent._id),
            name: parent.name,
            slug: parent.slug,
          }
        : null,
      children: children.map((child: any) => ({
        id: String(child._id),
        name: child.name,
        slug: child.slug,
      })),
      imageFileId: category.imageFileId || "",
      imageUrl: category.imageUrl || "",
      imagePath: category.imagePath || "",
      videoFileId: category.videoFileId || "",
      videoUrl: category.videoUrl || "",
      videoPath: category.videoPath || "",
      showOnHome: category.showOnHome,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load category" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: Params
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid category id" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid category data" },
        { status: 400 }
      );
    }

    await connectDB();

    const data = parsed.data;

    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (data.slug || data.name) {
      const newSlug = slugify(
        data.slug || data.name || category.name
      );

      const existing = await Category.findOne({
        slug: newSlug,
        _id: { $ne: category._id },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Category slug already exists" },
          { status: 409 }
        );
      }

      category.slug = newSlug;
    }

    if (data.name !== undefined) {
      category.name = data.name;
    }

    if (data.parentId !== undefined) {
      if (data.parentId === id) {
        return NextResponse.json(
          { error: "Category cannot be its own parent" },
          { status: 400 }
        );
      }

      category.parent = data.parentId
        ? new mongoose.Types.ObjectId(data.parentId)
        : null;
    }

    if (data.imageFileId !== undefined) {
      category.imageFileId = data.imageFileId;
    }

    if (data.imageUrl !== undefined) {
      category.imageUrl = data.imageUrl;
    }

    if (data.imagePath !== undefined) {
      category.imagePath = data.imagePath;
    }

    if (data.videoFileId !== undefined) {
      const previousVideoId = category.videoFileId;

      category.videoFileId = data.videoFileId || null;

      if (previousVideoId && previousVideoId !== data.videoFileId) {
        await deleteImageKitFile(previousVideoId);
      }
    }

    if (data.videoUrl !== undefined) {
      category.videoUrl = data.videoUrl || null;
    }

    if (data.videoPath !== undefined) {
      category.videoPath = data.videoPath || null;
    }

    if (data.showOnHome !== undefined) {
      category.showOnHome = data.showOnHome;
    }

    if (data.sortOrder !== undefined) {
      category.sortOrder = data.sortOrder;
    }

    if (data.isActive !== undefined) {
      category.isActive = data.isActive;
    }

    await category.save();

    return NextResponse.json({
      id: String(category._id),
      name: category.name,
      slug: category.slug,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid category id" },
        { status: 400 }
      );
    }

    await connectDB();

    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const [productCount, childCount] = await Promise.all([
      Product.countDocuments({
        category: category._id,
      }),
      Category.countDocuments({
        parent: category._id,
      }),
    ]);

    if (productCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete category because products exist in this category",
        },
        { status: 409 }
      );
    }

    if (childCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete category because child categories exist",
        },
        { status: 409 }
      );
    }

    if (category.imageFileId) {
      await deleteImageKitFile(category.imageFileId);
    }

    if (category.videoFileId) {
      await deleteImageKitFile(category.videoFileId);
    }

    await Category.deleteOne({
      _id: category._id,
    });

    return NextResponse.json({
      ok: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}