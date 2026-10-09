import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";

import Slider from "@/lib/db/models/Slider";
import { connectDB } from "@/lib/db/mongoose";
import { getSession } from "@/lib/auth";
import { deleteImageKitFiles } from "@/lib/imagekit/delete";

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

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid slider id" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = sliderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid slider data" }, { status: 400 });
    }

    await connectDB();

    const slider = await Slider.findById(id);

    if (!slider) {
      return NextResponse.json({ error: "Slider not found" }, { status: 404 });
    }

    const data = parsed.data;
    const previousFileId = slider.fileId;
    const previousVideoId = slider.videoFileId;

    slider.title = data.title;
    slider.fileId = data.fileId || null;
    slider.url = data.url || null;
    slider.filePath = data.filePath || null;
    slider.videoFileId = data.videoFileId || null;
    slider.videoUrl = data.videoUrl || null;
    slider.videoPath = data.videoPath || null;
    slider.linkUrl = data.linkUrl || null;
    slider.sortOrder = data.sortOrder;
    slider.isActive = data.isActive;

    await slider.save();

    if (previousFileId && previousFileId !== data.fileId) {
      await deleteImageKitFiles([previousFileId]);
    }

    if (previousVideoId && previousVideoId !== data.videoFileId) {
      await deleteImageKitFiles([previousVideoId]);
    }

    return NextResponse.json({
      id: String(slider._id),
      title: slider.title,
    });
  } catch (error) {
    console.error("Update slider error:", error);

    return NextResponse.json(
      { error: "Failed to update slider" },
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

    const slider = await Slider.findById(id);

    if (!slider) {
      return NextResponse.json({ error: "Slider not found" }, { status: 404 });
    }

    const fileIds = [slider.fileId, slider.videoFileId].filter(
      (fileId): fileId is string => Boolean(fileId)
    );

    if (fileIds.length) {
      await deleteImageKitFiles(fileIds);
    }

    await Slider.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete slider error:", error);

    return NextResponse.json(
      { error: "Failed to delete slider" },
      { status: 500 }
    );
  }
}
