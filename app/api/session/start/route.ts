import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const PHOTOS_PER_SESSION = 10;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerName } = body;

    if (!playerName || typeof playerName !== "string") {
      return NextResponse.json(
        { error: "Player name is required" },
        { status: 400 }
      );
    }

    console.log("Starting game for player:", playerName);

    // Найти или создать пользователя по имени
    let user = await prisma.user.findFirst({
      where: {
        name: playerName.trim(),
        role: "player",
      },
    });

    if (!user) {
      console.log("Creating new user:", playerName);
      user = await prisma.user.create({
        data: {
          name: playerName.trim(),
          role: "player",
        },
      });
    }

    console.log("User ID:", user.id);

    // Получить все активные фото с датами
    const availablePhotos = await prisma.photo.findMany({
      where: {
        isActive: true,
        exifTakenAt: { not: null },
      },
      select: { id: true },
    });

    console.log("Available photos:", availablePhotos.length);

    if (availablePhotos.length < PHOTOS_PER_SESSION) {
      return NextResponse.json(
        { error: `Not enough photos. Need ${PHOTOS_PER_SESSION}, found ${availablePhotos.length}` },
        { status: 400 }
      );
    }

    // Выбираем 10 случайных фото
    const shuffled = availablePhotos.sort(() => Math.random() - 0.5);
    const selectedPhotos = shuffled.slice(0, PHOTOS_PER_SESSION);

    // Рандомно выбираем 2 индекса для показа спецвопросов
    const specialIndices = new Set<number>();
    while (specialIndices.size < 2 && specialIndices.size < PHOTOS_PER_SESSION) {
      specialIndices.add(Math.floor(Math.random() * PHOTOS_PER_SESSION));
    }

    console.log("Special question indices:", Array.from(specialIndices));

    // Создать сессию
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        photoCount: PHOTOS_PER_SESSION,
        totalScore: 0,
        currentPhotoIndex: 0,
        sessionPhotos: {
          create: selectedPhotos.map((photo, index) => ({
            photoId: photo.id,
            orderIndex: index,
            showSpecial: specialIndices.has(index), // Помечаем 2 фото для показа спецвопроса
          })),
        },
      },
    });

    console.log("Session created:", session.id);

    return NextResponse.json({
      sessionId: session.id,
      userId: user.id,
      userName: user.name,
      photoCount: PHOTOS_PER_SESSION,
    });
  } catch (error) {
    console.error("Error starting session:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to start session", details: errorMessage },
      { status: 500 }
    );
  }
}
