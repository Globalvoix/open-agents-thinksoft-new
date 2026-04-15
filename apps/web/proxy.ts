import { EncryptJWT, base64url } from "jose";
import { type NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "_user_session_";

export default async function proxy(req: NextRequest) {
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);

  if (sessionCookie?.value) {
    return NextResponse.next();
  }

  const jweSecret = process.env.JWE_SECRET;
  if (!jweSecret) {
    return NextResponse.next();
  }

  const userId = crypto.randomUUID();
  const shortId = userId.replace(/-/g, "").substring(0, 8);
  const username = `guest-${shortId}`;

  const session = {
    created: Date.now(),
    authProvider: "github",
    user: {
      id: userId,
      username,
      email: undefined,
      avatar: "",
      name: "Guest User",
    },
  };

  let keyBytes: Uint8Array;
  try {
    keyBytes = base64url.decode(jweSecret);
    if (keyBytes.length !== 32) {
      console.error(
        `[proxy] JWE_SECRET decoded to ${keyBytes.length} bytes, expected 32. Skipping session creation.`,
      );
      return NextResponse.next();
    }
  } catch {
    console.error("[proxy] JWE_SECRET is not valid base64url. Skipping session creation.");
    return NextResponse.next();
  }

  const token = await new EncryptJWT(session as Record<string, unknown>)
    .setExpirationTime("1y")
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .encrypt(keyBytes);

  const response = NextResponse.next();
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    path: "/",
    httpOnly: true,
    maxAge: 365 * 24 * 60 * 60,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
