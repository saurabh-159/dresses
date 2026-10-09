import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

const COOKIE_NAME = "aw_session";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  userId: string,
  email: string
) {
  const token = await new SignJWT({
    sub: userId,
    email,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());

  return token;
}

export async function verifySessionToken(
  token: string
) {
  try {
    const result = await jwtVerify(
      token,
      getSecretKey()
    );

    return {
      sub: String(result.payload.sub),
      email: String(result.payload.email),
    };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();

  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;