import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { profileQuerySchema, validateQueryParams } from "@/app/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { userId } = validateQueryParams(profileQuerySchema, searchParams);

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's sessions with scores
    const sessions = await prisma.session.findMany({
      where: { 
        userId,
        finishedAt: { not: null },
      },
      include: {
        sessionPhotos: {
          include: { guesses: true },
        },
      },
      orderBy: { finishedAt: "desc" },
      take: 10, // Recent sessions
    });

    // Calculate stats
    const totalSessions = sessions.length;
    const sessionScores = sessions.map(session => {
      const sessionScore = session.sessionPhotos.reduce((sum, sp) => {
        const photoScore = sp.guesses.reduce((guessSum, guess) => guessSum + guess.scoreDelta, 0);
        return sum + photoScore;
      }, 0);
      return {
        id: session.id,
        mode: session.mode,
        score: sessionScore,
        photoCount: session.photoCount,
        finishedAt: session.finishedAt,
      };
    });

    const totalScore = sessionScores.reduce((sum, s) => sum + s.score, 0);
    const bestScore = Math.max(...sessionScores.map(s => s.score), 0);
    const avgScore = totalSessions > 0 ? totalScore / totalSessions : 0;

    // Get comments and likes
    const comments = await prisma.comment.findMany({
      where: { userId },
    });

    const likes = await prisma.commentLike.count({
      where: {
        comment: { userId },
      },
    });

    // Get achievements
    const achievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { awardedAt: "desc" },
    });

    const profile = {
      id: user.id,
      name: user.name || "Игрок",
      title: user.title,
      createdAt: user.createdAt,
      stats: {
        totalSessions,
        totalScore,
        bestScore,
        avgScore,
        totalComments: comments.length,
        totalLikes: likes,
        achievements: achievements.length,
      },
      recentSessions: sessionScores,
      achievements: achievements.map(ua => ({
        id: ua.achievement.id,
        title: ua.achievement.title,
        description: ua.achievement.description,
        awardedAt: ua.awardedAt,
      })),
    };

    return NextResponse.json(profile);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
