import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    // Получаем все достижения со скрытым флагом или категорией "скрытые"
    const achievements = await prisma.achievement.findMany({
      where: {
        OR: [
          { isHidden: true },
          { category: 'скрытые' },
        ],
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: [
        { category: 'asc' },
        { title: 'asc' },
      ],
    });

    // Для каждого достижения подсчитываем количество фото
    const achievementsWithCounts = await Promise.all(
      achievements.map(async (ach) => {
        const photoCount = await prisma.photo.count({
          where: {
            hiddenAchievementTitle: ach.title,
          },
        });

        return {
          id: ach.id,
          key: ach.key,
          title: ach.title,
          description: ach.description,
          icon: ach.icon,
          category: ach.category,
          rarity: ach.rarity,
          userCount: ach._count.users,
          photoCount,
        };
      })
    );

    return NextResponse.json({ achievements: achievementsWithCounts });
  } catch (error) {
    console.error("Error fetching hidden achievements:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Achievement ID is required" },
        { status: 400 }
      );
    }

    // Получаем достижение
    const achievement = await prisma.achievement.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!achievement) {
      return NextResponse.json(
        { error: "Achievement not found" },
        { status: 404 }
      );
    }

    // Удаляем связи с пользователями
    await prisma.userAchievement.deleteMany({
      where: { achievementId: id },
    });

    // Удаляем привязку к фото (обнуляем поля)
    await prisma.photo.updateMany({
      where: {
        hiddenAchievementTitle: achievement.title,
      },
      data: {
        hiddenAchievementTitle: null,
        hiddenAchievementDescription: null,
        hiddenAchievementIcon: null,
      },
    });

    // Удаляем само достижение
    await prisma.achievement.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Достижение "${achievement.title}" удалено`,
      usersAffected: achievement._count.users,
    });
  } catch (error) {
    console.error("Error deleting achievement:", error);
    return NextResponse.json(
      { error: "Failed to delete achievement" },
      { status: 500 }
    );
  }
}

