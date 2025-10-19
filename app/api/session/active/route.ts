import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { userIdSchema, validateQueryParams } from "@/app/lib/validation";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { userId } = validateQueryParams(z.object({ userId: userIdSchema }), searchParams);

    // Find active sessions (not finished) for the user
    const activeSessions = await prisma.session.findMany({
      where: {
        userId,
        finishedAt: null,
      },
      include: {
        sessionPhotos: {
          include: { photo: true },
          orderBy: { orderIndex: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sessions: activeSessions });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
