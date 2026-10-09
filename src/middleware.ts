import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "aw_session";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    return null;
  }

  return new TextEncoder().encode(secret);
}

async function hasValidSession(
  request: NextRequest
) {
  const token = request.cookies.get(
    COOKIE_NAME
  )?.value;

  if (!token) {
    return false;
  }

  const secret = getSecretKey();

  if (!secret) {
    return false;
  }

  try {
    await jwtVerify(token, secret);

    return true;
  } catch {
    return false;
  }
}

export async function middleware(
  request: NextRequest
) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const authenticated =
    await hasValidSession(request);

  if (!authenticated) {
    const loginUrl = new URL(
      "/admin/login",
      request.url
    );

    loginUrl.searchParams.set(
      "next",
      pathname
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};