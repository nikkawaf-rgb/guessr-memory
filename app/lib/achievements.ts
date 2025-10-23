// Система проверки и начисления достижений
import { prisma } from "./prisma";

interface SessionStats {
  sessionId: string;
  userId: string;
  totalScore: number;
  guesses: {
    yearHit: boolean;
    monthHit: boolean;
    dayHit: boolean;
    specialHit: boolean;
    scoreDelta: number;
    guessedYear: number | null;
    guessedMonth: number | null;
    guessedDay: number | null;
    photo: {
      id: string;
      exifTakenAt: Date | null;
      hiddenAchievementTitle: string | null;
      hiddenAchievementDescription: string | null;
      hiddenAchievementIcon: string | null;
    };
  }[];
  durationSeconds: number;
  createdAt: Date;
}

interface UserStats {
  totalGames: number;
  totalCombos: number;
  correctYears: number;
  correctMonths: number;
  correctDays: number;
  correctSpecialQuestions: number;
  bestScore: number;
  allAbove10k: boolean;
  allAbove8k: boolean;
  stableGames: boolean;
  gamesToday: number;
  recordBreaks: number;
}

// Проверка всех достижений для пользователя после игры
export async function checkAndGrantAchievements(stats: SessionStats) {
  const achievements: string[] = [];

  console.log('[ACHIEVEMENTS] Checking achievements for session:', stats.sessionId);
  console.log('[ACHIEVEMENTS] Total score:', stats.totalScore);
  console.log('[ACHIEVEMENTS] Guesses count:', stats.guesses.length);

  // Получаем статистику пользователя
  const userStats = await getUserStats(stats.userId);
  console.log('[ACHIEVEMENTS] User stats:', userStats);

  // Проверяем каждое достижение
  const checks = [
    checkYuriGagarin(stats),
    checkMilkyWay(userStats.totalGames),
    checkBlackHole(stats),
    checkMoonRover(stats),
    checkNaruto(userStats.correctSpecialQuestions),
    checkSharingan(stats),
    checkRubberRubber(stats),
    checkLegendTochkaRosta(stats),
    checkHeadshot(userStats.correctDays),
    checkAce(userStats),
    checkFlawlessVictory(stats),
    checkUltracombo(stats),
    checkFatality(stats),
    checkRespawn(userStats),
    checkSniper(userStats.totalCombos),
    checkCalendarMemory(userStats.correctMonths),
    checkChronometer(userStats.correctYears),
    checkTimeMachine(stats),
    checkPolygonalMesh(stats),
    checkRenderComplete(userStats.totalGames),
    checkSubdivisionSurface(userStats),
    checkTolerance001(stats),
    check3DProjection(stats),
    checkOrbitalSpeed(userStats),
    checkSoftLanding(stats),
    checkTrajectoryApogee(userStats),
    checkHydraulicStart(stats),
    checkPowderEngine(stats),
    checkStabilizers(userStats),
    checkDroneFailed(stats),
    checkLuckyNumber(stats),
  ];

  // Проверяем скрытые достижения (привязанные к фото)
  const hiddenAchievements = await checkHiddenAchievements(stats);

  for (const achievementKey of checks) {
    if (achievementKey) {
      console.log('[ACHIEVEMENTS] Granting achievement:', achievementKey);
      const granted = await grantAchievement(stats.userId, achievementKey);
      if (granted) {
        console.log('[ACHIEVEMENTS] Successfully granted:', achievementKey);
        achievements.push(achievementKey);
      } else {
        console.log('[ACHIEVEMENTS] Already has:', achievementKey);
      }
    }
  }

  // Добавляем скрытые достижения
  console.log('[ACHIEVEMENTS] Hidden achievements:', hiddenAchievements);
  achievements.push(...hiddenAchievements);

  // Проверяем Хокаге Точки Роста (все достижения)
  const hokage = await checkHokageTochkaRosta(stats.userId);
  if (hokage) achievements.push(hokage);

  console.log('[ACHIEVEMENTS] Total new achievements:', achievements.length);
  return achievements;
}

// Выдать достижение пользователю
async function grantAchievement(userId: string, achievementKey: string, photoId?: string): Promise<boolean> {
  try {
    const achievement = await prisma.achievement.findUnique({
      where: { key: achievementKey },
    });

    if (!achievement) return false;

    // Проверяем, нет ли уже этого достижения
    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    if (existing) return false;

    // Выдаём достижение
    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id,
        photoId,
      },
    });

    return true;
  } catch (error) {
    console.error('Error granting achievement:', error);
    return false;
  }
}

// Получить статистику пользователя
async function getUserStats(userId: string) {
  const sessions = await prisma.session.findMany({
    where: {
      userId,
      finishedAt: { not: null },
    },
    include: {
      sessionPhotos: {
        include: {
          guess: true,
        },
      },
    },
  });

  let totalCombos = 0;
  let correctYears = 0;
  let correctMonths = 0;
  let correctDays = 0;
  let correctSpecialQuestions = 0;
  let bestScore = 0;
  const recentScores: number[] = [];
  let recordBreaks = 0;
  let currentRecord = 0;

  for (const session of sessions) {
    recentScores.push(session.totalScore);
    if (recentScores.length > 10) recentScores.shift();

    if (session.totalScore > bestScore) {
      bestScore = session.totalScore;
      if (currentRecord > 0) recordBreaks++;
      currentRecord = session.totalScore;
    }

    for (const sp of session.sessionPhotos) {
      if (sp.guess) {
        if (sp.guess.yearHit && sp.guess.monthHit && sp.guess.dayHit) totalCombos++;
        if (sp.guess.yearHit) correctYears++;
        if (sp.guess.monthHit) correctMonths++;
        if (sp.guess.dayHit) correctDays++;
        if (sp.guess.specialHit) correctSpecialQuestions++;
      }
    }
  }

  // Проверяем последние 5 игр для "Эйс"
  const last5Scores = recentScores.slice(-5);
  const allAbove10k = last5Scores.length === 5 && last5Scores.every(s => s >= 10000);

  // Проверяем последние 5 игр для "Стабилизаторы"
  const stableGames = last5Scores.length === 5 && last5Scores.every(s => s >= 5000 && s <= 7000);

  // Проверяем последние 3 игры для "Орбитальная скорость"
  const last3Scores = recentScores.slice(-3);
  const allAbove8k = last3Scores.length === 3 && last3Scores.every(s => s >= 8000);

  // Подсчет игр за сегодня
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const gamesToday = sessions.filter(s => s.createdAt >= today).length;

  return {
    totalGames: sessions.length,
    totalCombos,
    correctYears,
    correctMonths,
    correctDays,
    correctSpecialQuestions,
    bestScore,
    recordBreaks,
    allAbove10k,
    allAbove8k,
    stableGames,
    gamesToday,
  };
}

// ===== Проверки конкретных достижений =====

function checkYuriGagarin(stats: SessionStats): string | null {
  // Комбо 12 апреля
  for (const guess of stats.guesses) {
    if (guess.yearHit && guess.monthHit && guess.dayHit) {
      if (guess.guessedMonth === 4 && guess.guessedDay === 12) {
        return 'yuri_gagarin';
      }
    }
  }
  return null;
}

function checkMilkyWay(totalGames: number): string | null {
  return totalGames >= 25 ? 'milky_way' : null;
}

function checkBlackHole(stats: SessionStats): string | null {
  for (const guess of stats.guesses) {
    if (guess.photo.exifTakenAt && guess.guessedYear) {
      const yearDiff = Math.abs(guess.guessedYear - guess.photo.exifTakenAt.getFullYear());
      if (yearDiff >= 100) return 'black_hole';
    }
  }
  return null;
}

function getHourInTimeZone(date: Date, timeZone: string): number {
  // Используем Intl, чтобы корректно получить час в заданном часовом поясе
  const parts = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    hour12: false,
    timeZone,
  }).formatToParts(date);
  const hourPart = parts.find(p => p.type === 'hour');
  return hourPart ? parseInt(hourPart.value, 10) : date.getUTCHours();
}

function checkMoonRover(stats: SessionStats): string | null {
  // По умолчанию считаем ночью по Иркутску (Asia/Irkutsk)
  const hourIrkutsk = getHourInTimeZone(stats.createdAt, 'Asia/Irkutsk');
  return (hourIrkutsk >= 0 && hourIrkutsk < 5) ? 'moon_rover' : null;
}

function checkNaruto(correctSpecialQuestions: number): string | null {
  return correctSpecialQuestions >= 10 ? 'naruto' : null;
}

function checkSharingan(stats: SessionStats): string | null {
  let streak = 0;
  for (const guess of stats.guesses) {
    if (guess.yearHit && guess.monthHit && guess.dayHit) {
      streak++;
      if (streak >= 3) return 'sharingan';
    } else {
      streak = 0;
    }
  }
  return null;
}

function checkRubberRubber(stats: SessionStats): string | null {
  return stats.durationSeconds >= 1800 ? 'rubber_rubber' : null; // 30 минут
}

function checkLegendTochkaRosta(stats: SessionStats): string | null {
  return stats.totalScore === 12000 ? 'legend_tochka_rosta' : null;
}

function checkHeadshot(correctDays: number): string | null {
  return correctDays >= 20 ? 'headshot' : null;
}

function checkAce(userStats: UserStats): string | null {
  return userStats.allAbove10k ? 'ace' : null;
}

function checkFlawlessVictory(stats: SessionStats): string | null {
  return stats.totalScore >= 11000 ? 'flawless_victory' : null;
}

function checkUltracombo(stats: SessionStats): string | null {
  let streak = 0;
  for (const guess of stats.guesses) {
    if (guess.yearHit && guess.monthHit && guess.dayHit) {
      streak++;
      if (streak >= 5) return 'ultracombo';
    } else {
      streak = 0;
    }
  }
  return null;
}

function checkFatality(stats: SessionStats): string | null {
  const lastGuess = stats.guesses[stats.guesses.length - 1];
  if (lastGuess && lastGuess.yearHit && lastGuess.monthHit && lastGuess.dayHit) {
    return 'fatality';
  }
  return null;
}

function checkRespawn(userStats: UserStats): string | null {
  return userStats.gamesToday >= 10 ? 'respawn' : null;
}

function checkSniper(totalCombos: number): string | null {
  return totalCombos >= 10 ? 'sniper' : null;
}

function checkCalendarMemory(correctMonths: number): string | null {
  return correctMonths >= 100 ? 'calendar_memory' : null;
}

function checkChronometer(correctYears: number): string | null {
  return correctYears >= 100 ? 'chronometer' : null;
}

function checkTimeMachine(stats: SessionStats): string | null {
  const allCombo = stats.guesses.every(g => g.yearHit && g.monthHit && g.dayHit);
  return allCombo ? 'time_machine' : null;
}

function checkPolygonalMesh(stats: SessionStats): string | null {
  let streak = 0;
  const months: number[] = [];
  
  for (const guess of stats.guesses) {
    if (guess.yearHit && guess.monthHit && guess.dayHit) {
      months.push(guess.guessedMonth || 0);
      streak++;
      
      if (streak >= 3) {
        const last3Months = months.slice(-3);
        const uniqueMonths = new Set(last3Months);
        if (uniqueMonths.size === 3) return 'polygonal_mesh';
      }
    } else {
      streak = 0;
      months.length = 0;
    }
  }
  return null;
}

function checkRenderComplete(totalGames: number): string | null {
  return totalGames >= 50 ? 'render_complete' : null;
}

function checkSubdivisionSurface(userStats: UserStats): string | null {
  return userStats.recordBreaks >= 5 ? 'subdivision_surface' : null;
}

function checkTolerance001(stats: SessionStats): string | null {
  for (const guess of stats.guesses) {
    if (guess.photo.exifTakenAt && guess.guessedYear && guess.guessedMonth && guess.guessedDay) {
      const yearDiff = Math.abs(guess.guessedYear - guess.photo.exifTakenAt.getFullYear());
      const monthDiff = Math.abs(guess.guessedMonth - (guess.photo.exifTakenAt.getMonth() + 1));
      const dayDiff = Math.abs(guess.guessedDay - guess.photo.exifTakenAt.getDate());
      
      if (yearDiff === 1 && monthDiff === 1 && dayDiff === 1) {
        return 'tolerance_001';
      }
    }
  }
  return null;
}

function check3DProjection(stats: SessionStats): string | null {
  const combos = stats.guesses.filter(g => g.yearHit && g.monthHit && g.dayHit).length;
  return combos >= 7 ? '3d_projection' : null;
}

function checkOrbitalSpeed(userStats: UserStats): string | null {
  return userStats.allAbove8k ? 'orbital_speed' : null;
}

function checkSoftLanding(stats: SessionStats): string | null {
  return (stats.totalScore >= 9500 && stats.totalScore <= 10500) ? 'soft_landing' : null;
}

function checkTrajectoryApogee(userStats: UserStats): string | null {
  return userStats.recordBreaks >= 10 ? 'trajectory_apogee' : null;
}

function checkHydraulicStart(stats: SessionStats): string | null {
  if (stats.guesses.length < 3) return null;
  const first3Score = stats.guesses.slice(0, 3).reduce((sum, g) => sum + g.scoreDelta, 0);
  return first3Score >= 3000 ? 'hydraulic_start' : null;
}

function checkPowderEngine(stats: SessionStats): string | null {
  if (stats.guesses.length < 3) return null;
  const last3Score = stats.guesses.slice(-3).reduce((sum, g) => sum + g.scoreDelta, 0);
  return last3Score >= 3000 ? 'powder_engine' : null;
}

function checkStabilizers(userStats: UserStats): string | null {
  return userStats.stableGames ? 'stabilizers' : null;
}

function checkDroneFailed(stats: SessionStats): string | null {
  for (const guess of stats.guesses) {
    if (guess.scoreDelta === 60) return 'drone_failed';
  }
  return null;
}

function checkLuckyNumber(stats: SessionStats): string | null {
  return stats.totalScore === 7777 ? 'lucky_number' : null;
}

function makeHiddenKeyFromTitle(title: string): string {
  // Формируем стабильный ключ по названию: hidden_<slug>
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9а-яё_]+/gi, '');
  return `hidden_${slug}`;
}

// Проверка скрытых достижений (привязанных к фото)
async function checkHiddenAchievements(stats: SessionStats): Promise<string[]> {
  const granted: string[] = [];

  for (const guess of stats.guesses) {
    // Новая логика: 500+ очков на фото со скрытым достижением (без учёта спецвопроса)
    if (guess.scoreDelta >= 500 && guess.photo.hiddenAchievementTitle) {
      // Ключ теперь общий для всех фото с одинаковым названием скрытого достижения
      const hiddenKey = makeHiddenKeyFromTitle(guess.photo.hiddenAchievementTitle);
      
      // Проверяем, есть ли уже такое достижение в базе
      let achievement = await prisma.achievement.findUnique({
        where: { key: hiddenKey },
      });

      // Если нет - создаём
      if (!achievement) {
        achievement = await prisma.achievement.create({
          data: {
            key: hiddenKey,
            title: guess.photo.hiddenAchievementTitle,
            description: guess.photo.hiddenAchievementDescription || `Секретное достижение за фото`,
            icon: guess.photo.hiddenAchievementIcon || '🎖️',
            category: 'скрытые',
            isHidden: true,
            rarity: 'legendary',
          },
        });
      }

      // Выдаём достижение (уникальность по пользователю и achievementId уже гарантирует, что вторично не выдастся)
      const wasGranted = await grantAchievement(stats.userId, hiddenKey, guess.photo.id);
      if (wasGranted) granted.push(hiddenKey);
    }
  }

  return granted;
}

// Проверка "Хокаге Точки Роста" (все достижения)
async function checkHokageTochkaRosta(userId: string): Promise<string | null> {
  const totalAchievements = await prisma.achievement.count({
    where: { key: { not: 'hokage_tochka_rosta' } },
  });

  const userAchievements = await prisma.userAchievement.count({
    where: {
      userId,
      achievement: { key: { not: 'hokage_tochka_rosta' } },
    },
  });

  if (userAchievements >= totalAchievements) {
    return 'hokage_tochka_rosta';
  }

  return null;
}

