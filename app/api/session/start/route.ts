import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const PHOTOS_PER_SESSION = 10;
const SPECIAL_QUESTIONS_COUNT = 2; // Обязательно 2 спецвопроса в каждой игре

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

    // Найти пользователя по имени
    const user = await prisma.user.findUnique({
      where: {
        name: playerName.trim(),
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден. Пожалуйста, войдите в систему." },
        { status: 401 }
      );
    }

    console.log("User ID:", user.id);

    // Получить фото со спецвопросами
    const photosWithSpecial = await prisma.photo.findMany({
      where: {
        isActive: true,
        exifTakenAt: { not: null },
        specialQuestion: { not: null },
        specialAnswerCorrect: { not: null },
      },
      select: { id: true },
    });

    // Получить обычные фото (без спецвопросов)
    const regularPhotos = await prisma.photo.findMany({
      where: {
        isActive: true,
        exifTakenAt: { not: null },
      },
      select: { id: true },
    });

    console.log("Photos with special questions:", photosWithSpecial.length);
    console.log("Total available photos:", regularPhotos.length);

    // Проверяем, что есть минимум 2 фото со спецвопросами
    if (photosWithSpecial.length < SPECIAL_QUESTIONS_COUNT) {
      return NextResponse.json(
        { 
          error: `Not enough photos with special questions. Need ${SPECIAL_QUESTIONS_COUNT}, found ${photosWithSpecial.length}. Please add special questions to more photos.` 
        },
        { status: 400 }
      );
    }

    // Проверяем общее количество фото
    if (regularPhotos.length < PHOTOS_PER_SESSION) {
      return NextResponse.json(
        { error: `Not enough photos. Need ${PHOTOS_PER_SESSION}, found ${regularPhotos.length}` },
        { status: 400 }
      );
    }

    // Выбираем 2 случайных фото со спецвопросами
    const shuffledSpecial = photosWithSpecial.sort(() => Math.random() - 0.5);
    const selectedSpecial = shuffledSpecial.slice(0, SPECIAL_QUESTIONS_COUNT);
    const selectedSpecialIds = new Set(selectedSpecial.map(p => p.id));

    // Выбираем 8 случайных обычных фото (исключая уже выбранные со спецвопросами)
    const remainingCount = PHOTOS_PER_SESSION - SPECIAL_QUESTIONS_COUNT;
    const availableRegular = regularPhotos.filter(p => !selectedSpecialIds.has(p.id));
    const shuffledRegular = availableRegular.sort(() => Math.random() - 0.5);
    const selectedRegular = shuffledRegular.slice(0, remainingCount);

    // Объединяем и перемешиваем все фото
    const allSelected = [...selectedSpecial, ...selectedRegular];
    const finalShuffled = allSelected.sort(() => Math.random() - 0.5);

    console.log("Selected photos with special questions:", selectedSpecial.map(p => p.id));

    // Создаем Set с ID фото, у которых есть спецвопросы
    const specialPhotoIds = new Set(selectedSpecial.map(p => p.id));

    // Отслеживаем, сколько спецвопросов уже назначено
    let specialQuestionsAssigned = 0;

    // Создать сессию
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        photoCount: PHOTOS_PER_SESSION,
        totalScore: 0,
        currentPhotoIndex: 0,
        sessionPhotos: {
          create: finalShuffled.map((photo, index) => {
            // Проверяем, есть ли у фото спецвопрос И не превышен ли лимит
            const hasSpecialQuestion = specialPhotoIds.has(photo.id);
            const shouldShowSpecial = hasSpecialQuestion && specialQuestionsAssigned < SPECIAL_QUESTIONS_COUNT;
            
            if (shouldShowSpecial) {
              specialQuestionsAssigned++;
            }

            return {
              photoId: photo.id,
              orderIndex: index,
              // showSpecial = true только для первых 2 фото со спецвопросами
              showSpecial: shouldShowSpecial,
            };
          }),
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
