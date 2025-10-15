import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { photoId, content, authorName } = await req.json();
    if (!photoId || typeof content !== "string") {
      return NextResponse.json({ error: "photoId and content are required" }, { status: 400 });
    }
    const text = content.trim();
    if (!text || text.length > 200) {
      return NextResponse.json({ error: "content length 1..200" }, { status: 400 });
    }
    const name = (authorName || "Гость").toString().slice(0, 50);
    // Create lightweight user without email (guest) if necessary
    const user = await prisma.user.create({ data: { name } });
    const comment = await prisma.comment.create({
      data: {
        photoId,
        userId: user.id,
        content: text,
      },
    });
    return NextResponse.json({ id: comment.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "unknown" }, { status: 500 });
  }
}


