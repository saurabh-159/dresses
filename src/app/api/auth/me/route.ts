import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import AdminUser from "@/lib/db/models/AdminUser";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    const user = await AdminUser.findById(
      session.sub
    ).lean();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);

    return NextResponse.json(
      {
        error: "Unable to get session",
      },
      {
        status: 500,
      }
    );
  }
}