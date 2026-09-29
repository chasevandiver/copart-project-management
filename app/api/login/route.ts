import { NextRequest, NextResponse } from "next/server";
import { COOKIE, tokenFor } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const given = String(form.get("password") ?? "");
  const rawNext = String(form.get("next") ?? "/");
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";
  const password = process.env.BOARD_PASSWORD;

  if (!password || given !== password) {
    return NextResponse.redirect(new URL(`/login?error=1&next=${encodeURIComponent(next)}`, req.url), 303);
  }

  const res = NextResponse.redirect(new URL(next, req.url), 303);
  res.cookies.set(COOKIE, await tokenFor(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
