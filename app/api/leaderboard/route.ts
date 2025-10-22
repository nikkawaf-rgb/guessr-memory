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
            achievements: {
              include: {
                achievement: {
                  select: {
                    icon: true,
                    title: true,
                    description: true,
                    rarity: true,
                    category: true,
                  },
                },
              },
              take: 5, // Показываем топ-5 достижений
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
      orderBy: [
        { totalScore: "desc" },
        { finishedAt: "asc" }, // При равных очках - кто раньше
      ],
      take: 100, // Топ-100
    });

    // Подсчитываем количество скрытых достижений для каждого игрока
    const userIds = Array.from(new Set(sessions.map(s => s.userId)));
    const hiddenCounts = await Promise.all(
      userIds.map(async (userId) => {
        const count = await prisma.userAchievement.count({
          where: {
            userId,
            achievement: {
              category: 'скрытые',
            },
          },
        });
        return { userId, count };
      })
    );
    const hiddenCountMap = Object.fromEntries(hiddenCounts.map(h => [h.userId, h.count]));

    const entries = sessions.map((session, index) => ({
      rank: index + 1,
      userName: session.user.name,
      totalScore: session.totalScore,
      finishedAt: session.finishedAt!.toISOString(),
      sessionId: session.id,
      achievements: session.user.achievements.map(ua => ({
        icon: ua.achievement.icon,
        title: ua.achievement.title,
        description: ua.achievement.description,
        rarity: ua.achievement.rarity,
        category: ua.achievement.category,
      })),
      hiddenAchievementsCount: hiddenCountMap[session.userId] || 0,
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
