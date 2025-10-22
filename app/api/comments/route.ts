import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// Получить комментарии для фото
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get("photoId");
    const playerName = searchParams.get("playerName");

    if (!photoId) {
      return NextResponse.json(
        { error: "photoId is required" },
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: { photoId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Добавляем информацию о том, лайкнул ли текущий пользователь
    let currentUserId: string | null = null;
    if (playerName) {
      const user = await prisma.user.findUnique({
        where: { name: playerName },
        select: { id: true },
      });
      currentUserId = user?.id || null;
    }

    const commentsWithLikes = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      userName: comment.user.name,
      likesCount: comment.likes.length,
      isLikedByMe: currentUserId
        ? comment.likes.some((like) => like.userId === currentUserId)
        : false,
    }));

    return NextResponse.json({ comments: commentsWithLikes });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// Создать новый комментарий
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { photoId, playerName, content } = body;

    if (!photoId || !playerName || !content) {
      return NextResponse.json(
        { error: "photoId, playerName, and content are required" },
        { status: 400 }
      );
    }

    // Найти пользователя
    const user = await prisma.user.findUnique({
      where: { name: playerName },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Создать комментарий
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: user.id,
        photoId,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // Проверить достижение "Писатель" (первый комментарий)
    const userCommentsCount = await prisma.comment.count({
      where: { userId: user.id },
    });

    let newAchievement = null;
    if (userCommentsCount === 1) {
      // Это первый комментарий пользователя!
      const writerAchievement = await prisma.achievement.findUnique({
        where: { key: "first_comment" },
      });

      if (writerAchievement) {
        const existingAchievement = await prisma.userAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId: user.id,
              achievementId: writerAchievement.id,
            },
          },
        });

        if (!existingAchievement) {
          await prisma.userAchievement.create({
            data: {
              userId: user.id,
              achievementId: writerAchievement.id,
            },
          });

          newAchievement = {
            key: writerAchievement.key,
            title: writerAchievement.title,
            description: writerAchievement.description,
            icon: writerAchievement.icon,
          };
          
          console.log(`[ACHIEVEMENT] ${user.name} получил достижение "Писатель"!`);
        }
      }
    }

    return NextResponse.json({
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        userName: comment.user.name,
        likesCount: 0,
        isLikedByMe: false,
      },
      newAchievement,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

