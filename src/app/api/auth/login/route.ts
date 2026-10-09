import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import connectDB from "@/lib/db/mongoose";
import AdminUser from "@/lib/db/models/AdminUser";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Valid email and password are required",
        },
        {
          status: 400,
        }
      );
    }

    const email = parsed.data.email
      .trim()
      .toLowerCase();

    await connectDB();

    const user = await AdminUser.findOne({
      email,
    }).lean();

    if (!user) {
      return NextResponse.json(
        {
          error: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    const passwordMatches = await bcrypt.compare(
      parsed.data.password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          error: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    const token = await createSessionToken(
      String(user._id),
      user.email
    );

    const response = NextResponse.json({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        error: "Unable to sign in",
      },
      {
        status: 500,
      }
    );
  }
}