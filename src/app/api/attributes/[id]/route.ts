import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";

import Attribute from "@/lib/db/models/Attribute";
import connectDB from "@/lib/db/mongoose";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/slug";

const updateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  type: z.enum(["select", "color", "text"]).default("select"),
  values: z.array(z.string()).default([]),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

type Params = {
  params: Promise<{ id: string }>;
};

function cleanValues(values: string[]) {
  const seen = new Set<string>();
  const cleaned: string[] = [];

  for (const value of values) {
    const text = value.trim();
    const key = text.toLowerCase();

    if (!text || seen.has(key)) {
      continue;
    }

    seen.add(key);
    cleaned.push(text);
  }

  return cleaned;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid attribute id" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid attribute data" },
        { status: 400 }
      );
    }

    await connectDB();

    const attribute = await Attribute.findById(id);

    if (!attribute) {
      return NextResponse.json({ error: "Attribute not found" }, { status: 404 });
    }

    const data = parsed.data;
    const slug = slugify(data.slug || data.name);
    const values = cleanValues(data.values);

    if (!slug) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    if (values.length === 0) {
      return NextResponse.json(
        { error: "Add at least one attribute value" },
        { status: 400 }
      );
    }

    const existing = await Attribute.findOne({
      slug,
      _id: { $ne: attribute._id },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Attribute slug already exists" },
        { status: 409 }
      );
    }

    attribute.name = data.name.trim();
    attribute.slug = slug;
    attribute.type = data.type;
    attribute.values = values;
    attribute.sortOrder = data.sortOrder;
    attribute.isActive = data.isActive;

    await attribute.save();

    return NextResponse.json({
      id: String(attribute._id),
      name: attribute.name,
      slug: attribute.slug,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update attribute" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid attribute id" }, { status: 400 });
    }

    await connectDB();

    const attribute = await Attribute.findByIdAndDelete(id);

    if (!attribute) {
      return NextResponse.json({ error: "Attribute not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete attribute" },
      { status: 500 }
    );
  }
}
