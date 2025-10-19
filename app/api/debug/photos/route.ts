import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const photos = await prisma.photo.findMany({
      where: { isActive: true },
      select: {
        id: true,
        storagePath: true,
        originalName: true,
        fileSize: true,
        mimeType: true,
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Failed to fetch photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}
