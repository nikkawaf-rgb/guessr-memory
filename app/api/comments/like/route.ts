import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { commentId, playerName } = body;

    if (!commentId || !playerName) {
      return NextResponse.json(
        { error: "commentId and playerName are required" },
        { status: 400 }
      );
    }

    // Найти пользователя
    const user = await prisma.user.findUnique({
      where: { name: playerName },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Проверить, существует ли уже лайк
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId,
        },
      },
    });

    let newAchievement = null;

    if (existingLike) {
      // Убрать лайк
      await prisma.commentLike.delete({
        where: { id: existingLike.id },
      });

      return NextResponse.json({ action: "unliked" });
    } else {
      // Поставить лайк
      await prisma.commentLike.create({
        data: {
          userId: user.id,
          commentId,
        },
      });

      // Проверить достижение "Не имей 500 рублей..." (первый лайк)
      const userLikesCount = await prisma.commentLike.count({
        where: { userId: user.id },
      });

      if (userLikesCount === 1) {
        // Это первый лайк пользователя!
        const firstLikeAchievement = await prisma.achievement.findUnique({
          where: { key: "first_like" },
        });

        if (firstLikeAchievement) {
          const existingAchievement = await prisma.userAchievement.findUnique({
            where: {
              userId_achievementId: {
                userId: user.id,
                achievementId: firstLikeAchievement.id,
              },
            },
          });

          if (!existingAchievement) {
            await prisma.userAchievement.create({
              data: {
                userId: user.id,
                achievementId: firstLikeAchievement.id,
              },
            });

            newAchievement = {
              key: firstLikeAchievement.key,
              title: firstLikeAchievement.title,
              description: firstLikeAchievement.description,
              icon: firstLikeAchievement.icon,
            };

            console.log(`[ACHIEVEMENT] ${user.name} получил достижение "Не имей 500 рублей..."!`);
          }
        }
      }

      return NextResponse.json({ action: "liked", newAchievement });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}

