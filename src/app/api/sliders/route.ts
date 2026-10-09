import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import Slider from "@/lib/db/models/Slider";
import connectDB from "@/lib/db/mongoose";
import { getSession } from "@/lib/auth";

const sliderSchema = z.object({
  title: z.string().min(1),
  fileId: z.string().default(""),
  url: z.string().default(""),
  filePath: z.string().default(""),
  videoFileId: z.string().default(""),
  videoUrl: z.string().default(""),
  videoPath: z.string().default(""),
  linkUrl: z.string().default(""),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    await connectDB();

    const session = await getSession();

    const filter = session ? {} : { isActive: true };

    const sliders = await Slider.find(filter)
      .sort({ sortOrder: 1 })
      .lean();

    const items = sliders.map((slider: any) => ({
      id: String(slider._id),
      title: slider.title,
      fileId: slider.fileId || "",
      url: slider.url || "",
      filePath: slider.filePath || "",
      videoFileId: slider.videoFileId || "",
      videoUrl: slider.videoUrl || "",
      videoPath: slider.videoPath || "",
      linkUrl: slider.linkUrl || "",
      sortOrder: slider.sortOrder,
      isActive: slider.isActive,
    }));

    return NextResponse.json(items);
  } catch {
    return NextResponse.json(
      { error: "Failed to load sliders" },
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

    const parsed = sliderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid slider data" },
        { status: 400 }
      );
    }

    await connectDB();

    const data = parsed.data;

    const slider = await Slider.create({
      title: data.title,
      fileId: data.fileId,
      url: data.url,
      filePath: data.filePath,
      videoFileId: data.videoFileId,
      videoUrl: data.videoUrl,
      videoPath: data.videoPath,
      linkUrl: data.linkUrl,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    });

    return NextResponse.json(
      {
        id: String(slider._id),
        title: slider.title,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create slider" },
      { status: 500 }
    );
  }
}