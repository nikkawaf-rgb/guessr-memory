import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    // Получить всех пользователей с их завершёнными сессиями
    const users = await prisma.user.findMany({
      include: {
        sessions: {
          where: {
            finishedAt: {
              not: null,
            },
          },
          orderBy: {
            totalScore: 'desc',
          },
        },
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
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    // Формируем данные по каждому игроку
    const playerStats = users
      .map(user => {
        const completedGames = user.sessions.length;
        if (completedGames === 0) return null;

        const bestScore = Math.max(...user.sessions.map(s => s.totalScore));
        const totalScore = user.sessions.reduce((sum, s) => sum + s.totalScore, 0);
        const avgScore = Math.round(totalScore / completedGames);
        const bestSessionDate = user.sessions.find(s => s.totalScore === bestScore)?.finishedAt;

        const hiddenAchievementsCount = user.achievements.filter(
          ua => ua.achievement.category === 'скрытые'
        ).length;

        return {
          userId: user.id,
          userName: user.name,
          bestScore,
          avgScore,
          totalScore,
          gamesPlayed: completedGames,
          bestSessionDate: bestSessionDate?.toISOString() || new Date().toISOString(),
          achievements: user.achievements.slice(0, 5).map(ua => ({
            icon: ua.achievement.icon,
            title: ua.achievement.title,
            description: ua.achievement.description,
            rarity: ua.achievement.rarity,
            category: ua.achievement.category,
          })),
          hiddenAchievementsCount,
        };
      })
      .filter((stat): stat is NonNullable<typeof stat> => stat !== null)
      .sort((a, b) => {
        // Сортируем по лучшему результату
        if (b.bestScore !== a.bestScore) {
          return b.bestScore - a.bestScore;
        }
        // При равных результатах - по дате достижения
        return new Date(a.bestSessionDate).getTime() - new Date(b.bestSessionDate).getTime();
      });

    // Добавляем ранги
    const entries = playerStats.map((stat, index) => ({
      rank: index + 1,
      ...stat,
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
