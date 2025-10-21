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

    // Получить случайные активные фото с датами
    const availablePhotos = await prisma.photo.findMany({
      where: {
        isActive: true,
        exifTakenAt: {
          not: null,
        },
      },
      select: {
        id: true,
      },
    });

    console.log("Available photos:", availablePhotos.length);

    if (availablePhotos.length < PHOTOS_PER_SESSION) {
      return NextResponse.json(
        { error: `Not enough photos with dates. Need at least ${PHOTOS_PER_SESSION}, found ${availablePhotos.length}` },
        { status: 400 }
      );
    }

    // Выбрать случайные фото
    const shuffled = availablePhotos.sort(() => Math.random() - 0.5);
    const selectedPhotos = shuffled.slice(0, PHOTOS_PER_SESSION);

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
    return NextResponse.json(
      { error: "Failed to start session" },
      { status: 500 }
    );
  }
}
