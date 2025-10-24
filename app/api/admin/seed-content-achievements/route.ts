import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const contentAchievements = [
  {
    key: 'photographer',
    title: 'Фотограф',
    description: 'Загрузить первую фотографию',
    icon: '📷',
    category: 'Контент',
    rarity: 'common',
  },
  {
    key: 'archivist',
    title: 'Архивариус',
    description: 'Загрузить 5 одобренных фотографий',
    icon: '📁',
    category: 'Контент',
    rarity: 'common',
  },
  {
    key: 'collector',
    title: 'Коллекционер',
    description: 'Загрузить 10 одобренных фотографий',
    icon: '🖼️',
    category: 'Контент',
    rarity: 'rare',
  },
  {
    key: 'historian',
    title: 'Историк',
    description: 'Загрузить 25 одобренных фотографий',
    icon: '📚',
    category: 'Контент',
    rarity: 'epic',
  },
  {
    key: 'memory_keeper',
    title: 'Хранитель памяти',
    description: 'Загрузить по 1 одобренной фотографии за каждый год: 2021, 2022, 2023, 2024 и 2025',
    icon: '🏛️',
    category: 'Контент',
    rarity: 'legendary',
  },
];

export async function POST() {
  try {
    let added = 0;
    let skipped = 0;

    for (const achievement of contentAchievements) {
      const existing = await prisma.achievement.findUnique({
        where: { key: achievement.key },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.achievement.create({
        data: achievement,
      });
      added++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Добавлено: ${added}, пропущено (уже есть): ${skipped}` 
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to seed" },
      { status: 500 }
    );
  }
}

