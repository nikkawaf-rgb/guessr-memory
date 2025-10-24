import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      playerName,
      fileName,
      originalName,
      fileSize,
      mimeType,
      manualDate,
      uploaderComment,
    } = body;

    if (!fileName || !playerName) {
      return NextResponse.json(
        { error: "Имя файла и имя игрока обязательны" },
        { status: 400 }
      );
    }

    // Найти пользователя
    const user = await prisma.user.findUnique({
      where: { name: playerName },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден. Сначала сыграйте хотя бы одну игру!" },
        { status: 404 }
      );
    }

    // Преобразовать дату если есть
    let exifTakenAt: Date | null = null;
    if (manualDate) {
      exifTakenAt = new Date(manualDate);
    }

    // Создание записи в БД со статусом "pending"
    const photo = await prisma.photo.create({
      data: {
        storagePath: fileName,
        originalName: originalName || null,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
        exifTakenAt: exifTakenAt,
        uploadedBy: user.id,
        uploaderComment: uploaderComment || null,
        moderationStatus: "pending", // Ждёт модерации
        isActive: false, // Не показывать в игре до одобрения
      },
    });

    // Проверка достижения "Фотограф" (первая загрузка)
    const uploadedPhotosCount = await prisma.photo.count({
      where: {
        uploadedBy: user.id,
      },
    });

    let newAchievement = null;

    if (uploadedPhotosCount === 1) {
      const photographerAch = await prisma.achievement.findUnique({
        where: { key: "photographer" },
      });

      if (photographerAch) {
        const existingAch = await prisma.userAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId: user.id,
              achievementId: photographerAch.id,
            },
          },
        });

        if (!existingAch) {
          await prisma.userAchievement.create({
            data: {
              userId: user.id,
              achievementId: photographerAch.id,
            },
          });

          newAchievement = {
            title: photographerAch.title,
            description: photographerAch.description,
            icon: photographerAch.icon,
          };
        }
      }
    }

    return NextResponse.json({
      success: true,
      photoId: photo.id,
      message: exifTakenAt
        ? "✅ Фотография загружена с указанной датой. Ожидайте модерации."
        : "✅ Фотография загружена! ⚠️ Дата не указана - администратор добавит её при модерации.",
      newAchievement,
    });
  } catch (error) {
    console.error("User photo metadata error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

