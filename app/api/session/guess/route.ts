import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// Функция для подсчета очков
function calculateScore(
  correctDate: Date,
  guessedYear: number | null,
  guessedMonth: number | null,
  guessedDay: number | null
): { yearHit: boolean; monthHit: boolean; dayHit: boolean; score: number } {
  const correctYear = correctDate.getFullYear();
  const correctMonth = correctDate.getMonth() + 1; // 1-12
  const correctDay = correctDate.getDate();

  const yearHit = guessedYear === correctYear;
  const monthHit = guessedMonth === correctMonth;
  const dayHit = guessedDay === correctDay;

  let score = 0;

  // Год: 100 очков
  if (yearHit) {
    score += 100;
  }

  // Месяц: 50 очков (только если год правильный)
  if (yearHit && monthHit) {
    score += 50;
  }

  // День: 50 очков (только если год и месяц правильные)
  if (yearHit && monthHit && dayHit) {
    score += 50;
  }

  return { yearHit, monthHit, dayHit, score };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionPhotoId, guessedYear, guessedMonth, guessedDay } = body;

    if (!sessionPhotoId) {
      return NextResponse.json(
        { error: "Session photo ID is required" },
        { status: 400 }
      );
    }

    // Получить информацию о фото и сессии
    const sessionPhoto = await prisma.sessionPhoto.findUnique({
      where: { id: sessionPhotoId },
      include: {
        photo: true,
        session: true,
        guess: true,
      },
    });

    if (!sessionPhoto) {
      return NextResponse.json(
        { error: "Session photo not found" },
        { status: 404 }
      );
    }

    // Проверить, что еще нет ответа
    if (sessionPhoto.guess) {
      return NextResponse.json(
        { error: "Already answered" },
        { status: 400 }
      );
    }

    // Проверить, что есть дата EXIF
    if (!sessionPhoto.photo.exifTakenAt) {
      return NextResponse.json(
        { error: "Photo has no EXIF date" },
        { status: 400 }
      );
    }

    // Подсчитать результат
    const result = calculateScore(
      sessionPhoto.photo.exifTakenAt,
      guessedYear,
      guessedMonth,
      guessedDay
    );

    // Сохранить ответ
    await prisma.guess.create({
      data: {
        sessionPhotoId,
        guessedYear,
        guessedMonth,
        guessedDay,
        yearHit: result.yearHit,
        monthHit: result.monthHit,
        dayHit: result.dayHit,
        scoreDelta: result.score,
      },
    });

    // Обновить счет сессии и перейти к следующему фото
    const updatedSession = await prisma.session.update({
      where: { id: sessionPhoto.sessionId },
      data: {
        totalScore: { increment: result.score },
        currentPhotoIndex: { increment: 1 },
      },
    });

    // Проверить, закончилась ли игра
    if (updatedSession.currentPhotoIndex >= updatedSession.photoCount) {
      await prisma.session.update({
        where: { id: sessionPhoto.sessionId },
        data: {
          finishedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      result: {
        yearHit: result.yearHit,
        monthHit: result.monthHit,
        dayHit: result.dayHit,
        score: result.score,
      },
      correctDate: sessionPhoto.photo.exifTakenAt,
    });
  } catch (error) {
    console.error("Error processing guess:", error);
    return NextResponse.json(
      { error: "Failed to process guess" },
      { status: 500 }
    );
  }
}

