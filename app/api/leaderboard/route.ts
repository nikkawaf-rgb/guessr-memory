import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    // Получить все завершенные сессии, отсортированные по очкам
    const sessions = await prisma.session.findMany({
      where: {
        finishedAt: {
          not: null,
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { totalScore: "desc" },
        { finishedAt: "asc" }, // При равных очках - кто раньше
      ],
      take: 100, // Топ-100
    });

    const entries = sessions.map((session, index) => ({
      rank: index + 1,
      userName: session.user.name,
      totalScore: session.totalScore,
      finishedAt: session.finishedAt!.toISOString(),
      sessionId: session.id,
    }));

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
