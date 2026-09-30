import { NextRequest, NextResponse } from "next/server";
import { OpError, type Op } from "@/lib/ops";
import { runOp } from "@/lib/store";

// Behind the password gate in middleware.ts. Origin check blocks cross-site posts.
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) {
    return NextResponse.json({ ok: false, error: "Bad origin" }, { status: 403 });
  }

  let op: Op;
  try {
    op = (await req.json()) as Op;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  try {
    const { summary } = await runOp(op);
    return NextResponse.json({ ok: true, summary });
  } catch (e) {
    if (e instanceof OpError) return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    console.error(e);
    return NextResponse.json({ ok: false, error: "Save failed. Try again in a moment." }, { status: 500 });
  }
}
