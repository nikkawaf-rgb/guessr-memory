import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { achievementQuerySchema, validateQueryParams } from "@/app/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { userId } = validateQueryParams(achievementQuerySchema, searchParams);

    // Get user's achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { awardedAt: "desc" },
    });

    // Get all available achievements to show progress
    const allAchievements = await prisma.achievement.findMany({
      orderBy: { createdAt: "asc" },
    });

    const achievedIds = new Set(userAchievements.map(ua => ua.achievementId));
    
    const achievements = allAchievements.map(achievement => ({
      id: achievement.id,
      code: achievement.code,
      title: achievement.title,
      description: achievement.description,
      achieved: achievedIds.has(achievement.id),
      awardedAt: userAchievements.find(ua => ua.achievementId === achievement.id)?.awardedAt || null,
    }));

    return NextResponse.json({ 
      achievements,
      totalAchieved: userAchievements.length,
      totalAvailable: allAchievements.length,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
