import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const ACHIEVEMENTS = {
  start: {
    key: "efd_license",
    title: "Я получил права",
    description: "Найти и сыграть в скрытую игру EFD",
    icon: "🚚",
    category: "EFD",
    rarity: "common",
  },
  win: {
    key: "escape_from_donbass",
    title: "Escape from Donbass",
    description: "Пройти мини-игру EFD",
    icon: "🏁",
    category: "EFD",
    rarity: "epic",
  },
} as const;

export async function POST(req: NextRequest) {
  try {
    const { userId, type } = await req.json();
    if (!userId || (type !== "start" && type !== "win")) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const def = ACHIEVEMENTS[type as keyof typeof ACHIEVEMENTS];

    // Находим достижение (оно должно быть создано через seed)
    const ach = await prisma.achievement.findUnique({ where: { key: def.key } });
    if (!ach) {
      return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
    }

    // Выдаём, если ещё не выдано
    await prisma.userAchievement.upsert({
      where: {
        userId_achievementId: {
          userId,
          achievementId: ach.id,
        },
      },
      update: {},
      create: { userId, achievementId: ach.id },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("EFD award error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


