import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import exifr from "exifr";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const playerName = formData.get("playerName") as string;
    const manualDate = formData.get("manualDate") as string | null;

    if (!file || !playerName) {
      return NextResponse.json(
        { error: "Файл и имя игрока обязательны" },
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

    // Проверка типа файла
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Можно загружать только изображения" },
        { status: 400 }
      );
    }

    // Проверка размера (макс 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Размер файла не должен превышать 10MB" },
        { status: 400 }
      );
    }

    // Генерация UUID-подобного имени файла
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const randomId = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    const fileName = `user_${randomId}.${fileExt}`;

    // Загрузка в Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: "Ошибка загрузки файла" },
        { status: 500 }
      );
    }

    // Парсинг EXIF данных
    let exifData: Record<string, unknown> | null = null;
    let exifTakenAt: Date | null = null;
    let autoDetectedDate = false;

    try {
      exifData = await exifr.parse(buffer, { pick: ["DateTimeOriginal", "CreateDate", "DateTime"] }) as Record<string, unknown> | undefined || null;
      
      if (exifData) {
        const dateSource = exifData.DateTimeOriginal || exifData.CreateDate || exifData.DateTime;
        if (dateSource && (typeof dateSource === 'string' || typeof dateSource === 'number' || dateSource instanceof Date)) {
          exifTakenAt = new Date(dateSource);
          autoDetectedDate = true;
        }
      }
    } catch (exifError) {
      console.log("EXIF parsing failed (это нормально для некоторых файлов):", exifError);
    }

    // Если EXIF не найден, но указана ручная дата
    if (!exifTakenAt && manualDate) {
      exifTakenAt = new Date(manualDate);
    }

    // Создание записи в БД со статусом "pending"
    const photo = await prisma.photo.create({
      data: {
        storagePath: fileName,
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        exifTakenAt: exifTakenAt,
        exifRaw: exifData || undefined,
        uploadedBy: user.id,
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
      autoDetectedDate,
      exifDate: exifTakenAt?.toISOString(),
      message: autoDetectedDate
        ? "✅ Фотография загружена! Дата определена автоматически из EXIF. Ожидайте модерации."
        : exifTakenAt
        ? "✅ Фотография загружена с указанной датой. Ожидайте модерации."
        : "✅ Фотография загружена! ⚠️ Дата не указана - администратор добавит её при модерации.",
      newAchievement,
    });
  } catch (error) {
    console.error("User photo upload error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

