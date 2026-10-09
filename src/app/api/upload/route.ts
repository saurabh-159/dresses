import { NextRequest, NextResponse } from "next/server";

import imagekit from "@/lib/imagekit/server";
import { getSession } from "@/lib/auth";

const allowedFolders = [
  "/dresses/products",
  "/dresses/categories",
  "/dresses/sliders",
  "/dresses/site",
];

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file");
    const folderValue = formData.get("folder");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    const folder =
      typeof folderValue === "string"
        ? folderValue
        : "/dresses/products";

    if (!allowedFolders.includes(folder)) {
      return NextResponse.json(
        { error: "Invalid upload folder" },
        { status: 400 }
      );
    }

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Only image and video files are allowed" },
        { status: 400 }
      );
    }

    const maxSize = isVideo ? 40 * 1024 * 1024 : 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: isVideo
            ? "Video size must be 40MB or less"
            : "Image size must be 5MB or less",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const result = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder,
      useUniqueFileName: true,
    });

    return NextResponse.json({
      fileId: result.fileId,
      url: result.url,
      filePath: result.filePath,
    });
  } catch (error) {
    console.error("ImageKit upload error:", error);

    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const fileId = body.fileId;

    if (!fileId || typeof fileId !== "string") {
      return NextResponse.json(
        { error: "fileId is required" },
        { status: 400 }
      );
    }

    await imagekit.deleteFile(fileId);

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("ImageKit delete error:", error);

    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}