import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const mode = (body?.mode === "fun" ? "fun" : "ranked") as "ranked" | "fun";

    // Pick up to 10 random active photos
    const photos = await prisma.photo.findMany({ where: { isActive: true }, take: 200, orderBy: { createdAt: "desc" } });
    if (!photos.length) return NextResponse.json({ error: "no photos" }, { status: 400 });
    const shuffled = [...photos].sort(() => Math.random() - 0.5).slice(0, Math.min(10, photos.length));

    // Temporary guest user until auth is wired for players
    const user = await prisma.user.create({ data: { name: "Гость" } });

    const session = await prisma.session.create({
      data: {
        mode,
        photoCount: shuffled.length,
        userId: user.id,
        sessionPhotos: {
          create: shuffled.map((p, idx) => ({ photoId: p.id, orderIndex: idx })),
        },
      },
      include: { sessionPhotos: true },
    });

    return NextResponse.json({ id: session.id });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


