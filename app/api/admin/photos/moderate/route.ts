import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// Проверка достижений за загрузку фотографий
async function checkUploadAchievements(userId: string) {
  const newAchievements = [];

  // Получаем все одобренные фото пользователя
  const approvedPhotos = await prisma.photo.findMany({
    where: {
      uploadedBy: userId,
      moderationStatus: "approved",
    },
    select: {
      id: true,
      exifTakenAt: true,
    },
  });

  const approvedCount = approvedPhotos.length;

  // Достижение 1: Архивариус (5 фото)
  if (approvedCount >= 5) {
    const ach = await prisma.achievement.findUnique({
      where: { key: "archivist" },
    });

    if (ach) {
      const existing = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: ach.id,
          },
        },
      });

      if (!existing) {
        await prisma.userAchievement.create({
          data: { userId, achievementId: ach.id },
        });
        newAchievements.push({ title: ach.title, description: ach.description, icon: ach.icon });
      }
    }
  }

  // Достижение 2: Коллекционер (10 фото)
  if (approvedCount >= 10) {
    const ach = await prisma.achievement.findUnique({
      where: { key: "collector" },
    });

    if (ach) {
      const existing = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: ach.id,
          },
        },
      });

      if (!existing) {
        await prisma.userAchievement.create({
          data: { userId, achievementId: ach.id },
        });
        newAchievements.push({ title: ach.title, description: ach.description, icon: ach.icon });
      }
    }
  }

  // Достижение 3: Историк (25 фото)
  if (approvedCount >= 25) {
    const ach = await prisma.achievement.findUnique({
      where: { key: "historian" },
    });

    if (ach) {
      const existing = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: ach.id,
          },
        },
      });

      if (!existing) {
        await prisma.userAchievement.create({
          data: { userId, achievementId: ach.id },
        });
        newAchievements.push({ title: ach.title, description: ach.description, icon: ach.icon });
      }
    }
  }

  // Достижение 4: Хранитель памяти (по 1 фото за каждый год 2021-2025)
  const yearsRequired = [2021, 2022, 2023, 2024, 2025];
  const yearsFound = new Set<number>();

  approvedPhotos.forEach((photo) => {
    if (photo.exifTakenAt) {
      const year = new Date(photo.exifTakenAt).getFullYear();
      if (yearsRequired.includes(year)) {
        yearsFound.add(year);
      }
    }
  });

  if (yearsFound.size === yearsRequired.length) {
    const ach = await prisma.achievement.findUnique({
      where: { key: "memory_keeper" },
    });

    if (ach) {
      const existing = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: ach.id,
          },
        },
      });

      if (!existing) {
        await prisma.userAchievement.create({
          data: { userId, achievementId: ach.id },
        });
        newAchievements.push({ title: ach.title, description: ach.description, icon: ach.icon });
      }
    }
  }

  return newAchievements;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photoId, action, reason } = body;

    if (!photoId || !action) {
      return NextResponse.json(
        { error: "photoId и action обязательны" },
        { status: 400 }
      );
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "action должен быть 'approve' или 'reject'" },
        { status: 400 }
      );
    }

    // Найти фото
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      select: { id: true, uploadedBy: true, moderationStatus: true },
    });

    if (!photo) {
      return NextResponse.json({ error: "Фото не найдено" }, { status: 404 });
    }

    // Обновить статус модерации
    const updatedPhoto = await prisma.photo.update({
      where: { id: photoId },
      data: {
        moderationStatus: action === "approve" ? "approved" : "rejected",
        moderatedAt: new Date(),
        rejectionReason: action === "reject" ? reason : null,
        isActive: action === "approve" ? true : false,
      },
    });

    // Если одобрено и есть загрузивший пользователь - проверяем достижения
    let newAchievements: { title: string; description: string; icon: string }[] = [];
    if (action === "approve" && photo.uploadedBy) {
      newAchievements = await checkUploadAchievements(photo.uploadedBy);
    }

    return NextResponse.json({
      success: true,
      photo: updatedPhoto,
      newAchievements: newAchievements.length > 0 ? newAchievements : undefined,
    });
  } catch (error) {
    console.error("Moderation error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

