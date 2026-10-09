import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import SiteSetting from "@/lib/db/models/SiteSetting";
import connectDB from "@/lib/db/mongoose";
import { getSession } from "@/lib/auth";

const settingsSchema = z.object({
  siteName: z.string().default("Dresses"),
  tagline: z.string().default(""),
  footerBlurb: z.string().default(""),
  aboutText: z.string().default(""),
  hours: z.string().default(""),
  address: z.string().default(""),
  phone1: z.string().default(""),
  phone2: z.string().default(""),
  email: z.string().default(""),
  whatsapp: z.string().default(""),
  facebook: z.string().default(""),
  instagram: z.string().default(""),
  linkedin: z.string().default(""),
  logoFileId: z.string().default(""),
  logoUrl: z.string().default(""),
  logoPath: z.string().default(""),
});

export async function GET() {
  try {
    await connectDB();

    let settings = await SiteSetting.findOne({
      key: "site",
    });

    if (!settings) {
      settings = await SiteSetting.create({
        key: "site",
        siteName: "Dresses",
      });
    }

    return NextResponse.json({
      id: String(settings._id),
      key: settings.key,
      siteName: settings.siteName || "Dresses",
      tagline: settings.tagline || "",
      footerBlurb: settings.footerBlurb || "",
      aboutText: settings.aboutText || "",
      hours: settings.hours || "",
      address: settings.address || "",
      phone1: settings.phone1 || "",
      phone2: settings.phone2 || "",
      email: settings.email || "",
      whatsapp: settings.whatsapp || "",
      facebook: settings.facebook || "",
      instagram: settings.instagram || "",
      linkedin: settings.linkedin || "",
      logoFileId: settings.logoFileId || "",
      logoUrl: settings.logoUrl || "",
      logoPath: settings.logoPath || "",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid settings data" },
        { status: 400 }
      );
    }

    await connectDB();

    const settings = await SiteSetting.findOneAndUpdate(
      {
        key: "site",
      },
      {
        $set: parsed.data,
        $setOnInsert: {
          key: "site",
        },
      },
      {
        new: true,
        upsert: true,
      }
    ).lean();

    if (!settings) {
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: String(settings._id),
      key: settings.key,
      ...parsed.data,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}