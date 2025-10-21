import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const [
      totalPhotos,
      photosWithDates,
      totalSessions,
      completedSessions,
      totalPlayers,
    ] = await Promise.all([
      prisma.photo.count(),
      prisma.photo.count({
        where: {
          exifTakenAt: {
            not: null,
          },
        },
      }),
      prisma.session.count(),
      prisma.session.count({
        where: {
          finishedAt: {
            not: null,
          },
        },
      }),
      prisma.user.count({
        where: {
          role: "player",
        },
      }),
    ]);

    return NextResponse.json({
      totalPhotos,
      photosWithDates,
      totalSessions,
      completedSessions,
      totalPlayers,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

