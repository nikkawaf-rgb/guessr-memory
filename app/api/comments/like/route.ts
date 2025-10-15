import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { commentId } = await req.json();
    if (!commentId) return NextResponse.json({ error: "commentId required" }, { status: 400 });
    // anonymous like: create temp user for counting
    const user = await prisma.user.create({ data: { name: "Гость" } });
    await prisma.commentLike.create({ data: { commentId, userId: user.id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


