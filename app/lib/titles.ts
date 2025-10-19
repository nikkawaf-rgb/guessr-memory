import { prisma } from "@/app/lib/prisma";

export interface PlayerTitle {
  id: string;
  name: string;
  description: string;
  minRank?: number;
  minAchievements?: number;
  minScore?: number;
  requiredAchievements?: string[];
}

export const PLAYER_TITLES: PlayerTitle[] = [
  {
    id: "novice",
    name: "Новичок",
    description: "Начал свой путь в игре",
    minAchievements: 1,
  },
  {
    id: "explorer",
    name: "Исследователь",
    description: "Изучает мир через фотографии",
    minAchievements: 3,
  },
  {
    id: "detective",
    name: "Детектив",
    description: "Мастер анализа деталей",
    minAchievements: 5,
    requiredAchievements: ["FACE_EXPERT", "PLACE_EXPERT"],
  },
  {
    id: "historian",
    name: "Историк",
    description: "Знаток времен и эпох",
    minAchievements: 4,
    requiredAchievements: ["HISTORIAN", "SCHOLAR"],
  },
  {
    id: "perfectionist",
    name: "Перфекционист",
    description: "Стремится к идеалу",
    minAchievements: 3,
    requiredAchievements: ["PERFECTIONIST"],
  },
  {
    id: "socialite",
    name: "Душа компании",
    description: "Активный участник сообщества",
    minAchievements: 4,
    requiredAchievements: ["COMMENTATOR", "POPULAR"],
  },
  {
    id: "speedster",
    name: "Скоростной",
    description: "Быстрые решения",
    minAchievements: 2,
    requiredAchievements: ["SPEED_DEMON", "LIGHTNING"],
  },
  {
    id: "memory_keeper",
    name: "Хранитель памяти",
    description: "Вершина мастерства",
    minAchievements: 8,
    minScore: 8000,
  },
  {
    id: "legend",
    name: "Легенда",
    description: "Мифический статус",
    minAchievements: 10,
    minScore: 15000,
  },
];

export async function calculatePlayerTitle(userId: string): Promise<string | null> {
  // Get user's achievements and stats
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
  });

  const userSessions = await prisma.session.findMany({
    where: { 
      userId,
      finishedAt: { not: null },
    },
    include: {
      sessionPhotos: {
        include: { guesses: true },
      },
    },
  });

  // Calculate total score
  const totalScore = userSessions.reduce((sum, session) => {
    const sessionScore = session.sessionPhotos.reduce((photoSum, sp) => {
      const photoScore = sp.guesses.reduce((guessSum, guess) => guessSum + guess.scoreDelta, 0);
      return photoSum + photoScore;
    }, 0);
    return sum + sessionScore;
  }, 0);

  const achievementCodes = new Set(userAchievements.map(ua => ua.achievement.code));
  const achievementCount = userAchievements.length;

  // Find the highest title the user qualifies for
  let bestTitle: PlayerTitle | null = null;
  
  for (const title of PLAYER_TITLES) {
    // Check minimum achievements
    if (title.minAchievements && achievementCount < title.minAchievements) {
      continue;
    }

    // Check minimum score
    if (title.minScore && totalScore < title.minScore) {
      continue;
    }

    // Check required achievements
    if (title.requiredAchievements) {
      const hasAllRequired = title.requiredAchievements.every(code => achievementCodes.has(code));
      if (!hasAllRequired) {
        continue;
      }
    }

    // This title qualifies, check if it's better than current best
    if (!bestTitle || getTitleRank(title) > getTitleRank(bestTitle)) {
      bestTitle = title;
    }
  }

  return bestTitle?.name || null;
}

function getTitleRank(title: PlayerTitle): number {
  // Simple ranking system - higher number = better title
  const rankMap: Record<string, number> = {
    novice: 1,
    explorer: 2,
    detective: 3,
    historian: 3,
    perfectionist: 3,
    socialite: 3,
    speedster: 3,
    memory_keeper: 4,
    legend: 5,
  };
  
  return rankMap[title.id] || 0;
}

export async function updateUserTitle(userId: string): Promise<void> {
  const newTitle = await calculatePlayerTitle(userId);
  
  await prisma.user.update({
    where: { id: userId },
    data: { title: newTitle },
  });
}

export async function updateAllUserTitles(): Promise<void> {
  const users = await prisma.user.findMany({
    where: { role: "player" },
  });

  for (const user of users) {
    await updateUserTitle(user.id);
  }
}
