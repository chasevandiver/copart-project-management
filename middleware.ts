import { NextRequest, NextResponse } from "next/server";
import { COOKIE, tokenFor } from "./lib/auth";

export async function middleware(req: NextRequest) {
  const password = process.env.BOARD_PASSWORD;
  if (!password) {
    // Open locally, closed in production until the password is set.
    if (process.env.NODE_ENV !== "production") return NextResponse.next();
    return new NextResponse("BOARD_PASSWORD is not set in Vercel.", { status: 503 });
  }

  const cookie = req.cookies.get(COOKIE)?.value;
  if (cookie && cookie === (await tokenFor(password))) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(req.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!login|api/login|_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
