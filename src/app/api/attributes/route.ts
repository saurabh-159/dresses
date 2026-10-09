import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import Attribute from "@/lib/db/models/Attribute";
import connectDB from "@/lib/db/mongoose";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/slug";

const attributeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  type: z.enum(["select", "color", "text"]).default("select"),
  values: z.array(z.string()).default([]),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

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

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const attributes = await Attribute.find()
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    return NextResponse.json(
      attributes.map((attribute) => ({
        id: String(attribute._id),
        name: attribute.name,
        slug: attribute.slug,
        type: attribute.type || "select",
        values: attribute.values || [],
        sortOrder: attribute.sortOrder || 0,
        isActive: attribute.isActive !== false,
      }))
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to load attributes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = attributeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid attribute data" },
        { status: 400 }
      );
    }

    await connectDB();

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

    const existing = await Attribute.findOne({ slug });

    if (existing) {
      return NextResponse.json(
        { error: "Attribute slug already exists" },
        { status: 409 }
      );
    }

    const attribute = await Attribute.create({
      name: data.name.trim(),
      slug,
      type: data.type,
      values,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    });

    return NextResponse.json(
      {
        id: String(attribute._id),
        name: attribute.name,
        slug: attribute.slug,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create attribute" },
      { status: 500 }
    );
  }
}
