import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// Функция для проверки скрытого достижения на фото
async function checkPhotoHiddenAchievement(
  userId: string,
  photoId: string,
  scoreDelta: number,
  hiddenAchievementTitle: string | null,
  hiddenAchievementDescription: string | null,
  hiddenAchievementIcon: string | null
): Promise<{ key: string; title: string; description: string; icon: string } | null> {
  if (scoreDelta < 500 || !hiddenAchievementTitle) {
    return null;
  }

  // Генерируем ключ
  const slug = hiddenAchievementTitle
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9а-яё_]+/gi, '');
  const hiddenKey = `hidden_${slug}`;

  // Проверяем, есть ли уже такое достижение в базе
  let achievement = await prisma.achievement.findUnique({
    where: { key: hiddenKey },
  });

  // Если нет - создаём
  if (!achievement) {
    achievement = await prisma.achievement.create({
      data: {
        key: hiddenKey,
        title: hiddenAchievementTitle,
        description: hiddenAchievementDescription || `Секретное достижение за фото`,
        icon: hiddenAchievementIcon || '👻',
        category: 'скрытые',
        isHidden: true,
        rarity: 'legendary',
      },
    });
  }

  // Проверяем, нет ли уже этого достижения у пользователя
  const existing = await prisma.userAchievement.findUnique({
    where: {
      userId_achievementId: {
        userId,
        achievementId: achievement.id,
      },
    },
  });

  if (existing) {
    return null; // Уже есть
  }

  // Выдаём достижение
  await prisma.userAchievement.create({
    data: {
      userId,
      achievementId: achievement.id,
      photoId,
    },
  });

  return {
    key: hiddenKey,
    title: achievement.title,
    description: achievement.description,
    icon: achievement.icon,
  };
}

// Функция для подсчета очков с прогрессивной шкалой
function calculateScore(
  correctDate: Date,
  guessedYear: number | null,
  guessedMonth: number | null,
  guessedDay: number | null,
  specialCorrect: string | null,
  guessedSpecial: string | null
): {
  yearHit: boolean;
  monthHit: boolean;
  dayHit: boolean;
  specialHit: boolean;
  score: number;
  yearScore: number;
  monthScore: number;
  dayScore: number;
  specialScore: number;
  yearDiff: number;
  monthDiff: number;
  dayDiff: number;
  isCombo: boolean;
} {
  const correctYear = correctDate.getFullYear();
  const correctMonth = correctDate.getMonth() + 1; // 1-12
  const correctDay = correctDate.getDate();

  const yearDiff = guessedYear !== null ? Math.abs(guessedYear - correctYear) : 999;
  const monthDiff = guessedMonth !== null ? Math.abs(guessedMonth - correctMonth) : 12;
  const dayDiff = guessedDay !== null ? Math.abs(guessedDay - correctDay) : 31;

  const yearHit = yearDiff === 0;
  const monthHit = monthDiff === 0;
  const dayHit = dayDiff === 0;
  const specialHit = specialCorrect && guessedSpecial ? guessedSpecial.trim() === specialCorrect.trim() : false;

  // Прогрессивная шкала для года (макс 100)
  let yearScore = 0;
  if (yearDiff === 0) yearScore = 100;
  else if (yearDiff === 1) yearScore = 80;
  else if (yearDiff === 2) yearScore = 60;
  else if (yearDiff === 3) yearScore = 40;
  else if (yearDiff >= 4) yearScore = 20;

  // Прогрессивная шкала для месяца (макс 200)
  let monthScore = 0;
  if (monthDiff === 0) monthScore = 200;
  else if (monthDiff === 1) monthScore = 150;
  else if (monthDiff === 2) monthScore = 100;
  else if (monthDiff === 3) monthScore = 60;
  else if (monthDiff === 4) monthScore = 40;
  else if (monthDiff >= 5) monthScore = 20;

  // Прогрессивная шкала для дня (макс 300)
  let dayScore = 0;
  if (dayDiff === 0) dayScore = 300;
  else if (dayDiff === 1) dayScore = 250;
  else if (dayDiff === 2) dayScore = 200;
  else if (dayDiff === 3) dayScore = 150;
  else if (dayDiff === 4) dayScore = 120;
  else if (dayDiff === 5) dayScore = 100;
  else if (dayDiff <= 7) dayScore = 80;
  else if (dayDiff <= 10) dayScore = 60;
  else if (dayDiff <= 15) dayScore = 40;
  else if (dayDiff >= 16) dayScore = 20;

  // Проверка комбо
  const isCombo = yearHit && monthHit && dayHit;

  let score = 0;
  if (isCombo) {
    // КОМБО! Все три правильно = 1000 очков (вместо 600)
    score = 1000;
  } else {
    // Суммируем прогрессивные очки
    score = yearScore + monthScore + dayScore;
  }

  // Спецвопрос: +1000 очков
  const specialScore = specialHit ? 1000 : 0;
  score += specialScore;

  return {
    yearHit,
    monthHit,
    dayHit,
    specialHit,
    score,
    yearScore: isCombo ? 100 : yearScore,
    monthScore: isCombo ? 200 : monthScore,
    dayScore: isCombo ? 300 : dayScore,
    specialScore,
    yearDiff,
    monthDiff,
    dayDiff,
    isCombo,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionPhotoId, guessedYear, guessedMonth, guessedDay, guessedSpecial } = body;

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
      guessedDay,
      sessionPhoto.photo.specialAnswerCorrect,
      guessedSpecial
    );

    // Сохранить ответ
    await prisma.guess.create({
      data: {
        sessionPhotoId,
        guessedYear,
        guessedMonth,
        guessedDay,
        guessedSpecial,
        yearHit: result.yearHit,
        monthHit: result.monthHit,
        dayHit: result.dayHit,
        specialHit: result.specialHit,
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

    // Проверяем скрытое достижение на этом фото
    const newAchievement = await checkPhotoHiddenAchievement(
      sessionPhoto.session.userId,
      sessionPhoto.photo.id,
      result.score,
      sessionPhoto.photo.hiddenAchievementTitle,
      sessionPhoto.photo.hiddenAchievementDescription,
      sessionPhoto.photo.hiddenAchievementIcon
    );

    if (newAchievement) {
      console.log('[HIDDEN] New achievement unlocked during gameplay:', newAchievement.title);
    }

    // Проверить, закончилась ли игра
    if (updatedSession.currentPhotoIndex >= updatedSession.photoCount) {
      const now = new Date();
      const durationSeconds = Math.floor((now.getTime() - updatedSession.createdAt.getTime()) / 1000);
      
      await prisma.session.update({
        where: { id: sessionPhoto.sessionId },
        data: {
          finishedAt: now,
          durationSeconds: durationSeconds,
        },
      });
      
      console.log(`[SESSION] Game finished! Duration: ${durationSeconds}s, Score: ${updatedSession.totalScore}`);
    }

    return NextResponse.json({
      success: true,
      result: {
        yearHit: result.yearHit,
        monthHit: result.monthHit,
        dayHit: result.dayHit,
        specialHit: result.specialHit,
        score: result.score,
        yearScore: result.yearScore,
        monthScore: result.monthScore,
        dayScore: result.dayScore,
        specialScore: result.specialScore,
        yearDiff: result.yearDiff,
        monthDiff: result.monthDiff,
        dayDiff: result.dayDiff,
        isCombo: result.isCombo,
      },
      sessionTotalScore: updatedSession.totalScore,
      currentPhotoIndex: updatedSession.currentPhotoIndex,
      photoCount: updatedSession.photoCount,
      newAchievement: newAchievement || undefined,
    });
  } catch (error) {
    console.error("Error processing guess:", error);
    return NextResponse.json(
      { error: "Failed to process guess" },
      { status: 500 }
    );
  }
}

