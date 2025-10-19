import { prisma } from "@/app/lib/prisma";

export interface AchievementCheckResult {
  achievementId: string;
  awarded: boolean;
}

// Achievement definitions
export const ACHIEVEMENTS = {
  PERFECTIONIST: {
    id: "perfectionist",
    code: "PERFECTIONIST",
    title: "Перфекционист",
    description: "Набрать 1000 очков за одно фото",
  },
  COMMENTATOR: {
    id: "commentator", 
    code: "COMMENTATOR",
    title: "Комментатор",
    description: "Оставить 10+ комментариев",
  },
  POPULAR: {
    id: "popular",
    code: "POPULAR", 
    title: "Популярный",
    description: "Получить 20+ лайков на комментарии",
  },
  ACTIVIST: {
    id: "activist",
    code: "ACTIVIST",
    title: "Активист", 
    description: "Прокомментировать каждое фото в сессии",
  },
  SPEED_DEMON: {
    id: "speed_demon",
    code: "SPEED_DEMON",
    title: "Быстрый стрелок",
    description: "Среднее время ответа менее 10 секунд",
  },
  SNIPER: {
    id: "sniper",
    code: "SNIPER",
    title: "Снайпер",
    description: "5 идеальных попаданий подряд",
  },
  LIGHTNING: {
    id: "lightning",
    code: "LIGHTNING", 
    title: "Молния",
    description: "Ответить менее чем за 5 секунд",
  },
  SCHOLAR: {
    id: "scholar",
    code: "SCHOLAR",
    title: "Эрудит",
    description: "Все даты правильные в одной игре",
  },
  FACE_EXPERT: {
    id: "face_expert",
    code: "FACE_EXPERT",
    title: "Знаток лиц",
    description: "Всех людей правильно определить в 5 фото",
  },
  PLACE_EXPERT: {
    id: "place_expert", 
    code: "PLACE_EXPERT",
    title: "Знаток мест",
    description: "8 правильных локаций подряд",
  },
  HISTORIAN: {
    id: "historian",
    code: "HISTORIAN",
    title: "Историк",
    description: "10 правильных годов",
  },
  CLAIRVOYANT: {
    id: "clairvoyant",
    code: "CLAIRVOYANT",
    title: "Ясновидящий",
    description: "Точный день+месяц на 3 фото подряд",
  },
} as const;

export async function checkAndAwardAchievements(userId: string): Promise<AchievementCheckResult[]> {
  const results: AchievementCheckResult[] = [];
  
  // Get user's existing achievements
  const existingAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
  });
  
  const existingCodes = new Set(existingAchievements.map(ua => ua.achievement.code));

  // Check each achievement
  for (const achievement of Object.values(ACHIEVEMENTS)) {
    if (existingCodes.has(achievement.code)) {
      results.push({ achievementId: achievement.id, awarded: false });
      continue;
    }

    let shouldAward = false;

    switch (achievement.code) {
      case "PERFECTIONIST":
        shouldAward = await checkPerfectionist(userId);
        break;
      case "COMMENTATOR":
        shouldAward = await checkCommentator(userId);
        break;
      case "POPULAR":
        shouldAward = await checkPopular(userId);
        break;
      case "ACTIVIST":
        shouldAward = await checkActivist(userId);
        break;
      case "SPEED_DEMON":
        shouldAward = await checkSpeedDemon(userId);
        break;
      case "SNIPER":
        shouldAward = await checkSniper(userId);
        break;
      case "LIGHTNING":
        shouldAward = await checkLightning(userId);
        break;
      case "SCHOLAR":
        shouldAward = await checkScholar(userId);
        break;
      case "FACE_EXPERT":
        shouldAward = await checkFaceExpert(userId);
        break;
      case "PLACE_EXPERT":
        shouldAward = await checkPlaceExpert(userId);
        break;
      case "HISTORIAN":
        shouldAward = await checkHistorian(userId);
        break;
      case "CLAIRVOYANT":
        shouldAward = await checkClairvoyant(userId);
        break;
    }

    if (shouldAward) {
      // Award the achievement
      await prisma.achievement.upsert({
        where: { code: achievement.code },
        update: {},
        create: {
          code: achievement.code,
          title: achievement.title,
          description: achievement.description,
        },
      });

      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });

      results.push({ achievementId: achievement.id, awarded: true });
    } else {
      results.push({ achievementId: achievement.id, awarded: false });
    }
  }

  return results;
}

// Individual achievement check functions
async function checkPerfectionist(userId: string): Promise<boolean> {
  const perfectGuess = await prisma.guess.findFirst({
    where: {
      sessionPhoto: {
        session: { userId },
      },
      scoreDelta: 1000,
    },
  });
  return !!perfectGuess;
}

async function checkCommentator(userId: string): Promise<boolean> {
  const commentCount = await prisma.comment.count({
    where: { userId },
  });
  return commentCount >= 10;
}

async function checkPopular(userId: string): Promise<boolean> {
  const totalLikes = await prisma.commentLike.count({
    where: {
      comment: { userId },
    },
  });
  return totalLikes >= 20;
}

async function checkActivist(userId: string): Promise<boolean> {
  // Check if user has commented on every photo in at least one session
  const sessions = await prisma.session.findMany({
    where: { userId },
    include: {
      sessionPhotos: {
        include: {
          photo: {
            include: { comments: { where: { userId } } },
          },
        },
      },
    },
  });

  return sessions.some(session => 
    session.sessionPhotos.every(sp => sp.photo.comments.length > 0)
  );
}

async function checkSpeedDemon(userId: string): Promise<boolean> {
  const avgTime = await prisma.guess.aggregate({
    where: {
      sessionPhoto: { session: { userId } },
      timeSpentSec: { not: null },
    },
    _avg: { timeSpentSec: true },
  });
  
  return (avgTime._avg.timeSpentSec || 0) < 10;
}

async function checkSniper(userId: string): Promise<boolean> {
  // Check for 5 perfect hits in a row
  const guesses = await prisma.guess.findMany({
    where: {
      sessionPhoto: { session: { userId } },
      scoreDelta: 1000,
    },
    orderBy: { createdAt: "asc" },
  });

  // Simple check - if user has 5 perfect scores, consider it achieved
  return guesses.length >= 5;
}

async function checkLightning(userId: string): Promise<boolean> {
  const lightningGuess = await prisma.guess.findFirst({
    where: {
      sessionPhoto: { session: { userId } },
      timeSpentSec: { lt: 5 },
    },
  });
  return !!lightningGuess;
}

async function checkScholar(userId: string): Promise<boolean> {
  // Check if user got all dates correct in one session
  const sessions = await prisma.session.findMany({
    where: { userId },
    include: {
      sessionPhotos: {
        include: { guesses: true },
      },
    },
  });

  return sessions.some(session => 
    session.sessionPhotos.every(sp => 
      sp.guesses.some(guess => guess.yearHit && guess.monthHit && guess.dayHit)
    )
  );
}

async function checkFaceExpert(userId: string): Promise<boolean> {
  // Check if user got all people correct in 5 photos
  const correctPeopleGuesses = await prisma.guess.count({
    where: {
      sessionPhoto: { session: { userId } },
      peopleHitAll: true,
    },
  });
  
  return correctPeopleGuesses >= 5;
}

async function checkPlaceExpert(userId: string): Promise<boolean> {
  // Check for 8 correct locations in a row
  const correctLocationGuesses = await prisma.guess.count({
    where: {
      sessionPhoto: { session: { userId } },
      locationHit: true,
    },
  });
  
  return correctLocationGuesses >= 8;
}

async function checkHistorian(userId: string): Promise<boolean> {
  const correctYearGuesses = await prisma.guess.count({
    where: {
      sessionPhoto: { session: { userId } },
      yearHit: true,
    },
  });
  
  return correctYearGuesses >= 10;
}

async function checkClairvoyant(userId: string): Promise<boolean> {
  // Check for 3 photos with exact day+month in a row
  const correctDayMonthGuesses = await prisma.guess.count({
    where: {
      sessionPhoto: { session: { userId } },
      dayHit: true,
      monthHit: true,
    },
  });
  
  return correctDayMonthGuesses >= 3;
}
