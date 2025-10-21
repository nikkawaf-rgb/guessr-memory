import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const playerName = searchParams.get("playerName");

    // Получаем все достижения
    const allAchievements = await prisma.achievement.findMany({
      orderBy: [
        { category: "asc" },
        { rarity: "desc" },
      ],
    });

    // Если указан игрок, получаем его достижения
    let userAchievements: string[] = [];
    if (playerName) {
      const user = await prisma.user.findFirst({
        where: {
          name: playerName,
          role: "player",
        },
        include: {
          achievements: {
            include: {
              achievement: true,
            },
          },
        },
      });

      if (user) {
        userAchievements = user.achievements.map(ua => ua.achievement.key);
      }
    }

    // Формируем ответ
    const achievements = allAchievements.map(achievement => ({
      id: achievement.id,
      key: achievement.key,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      category: achievement.category,
      rarity: achievement.rarity,
      unlocked: userAchievements.includes(achievement.key),
    }));

    return NextResponse.json({ achievements });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}

