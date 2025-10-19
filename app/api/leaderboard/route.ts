import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "all"; // all, daily, weekly
    const mode = searchParams.get("mode") || "ranked"; // ranked, fun

    const dateFilter: { gte?: Date } = {};
    
    if (period === "daily") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateFilter.gte = today;
    } else if (period === "weekly") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter.gte = weekAgo;
    }

    // Get completed sessions with scores
    const sessions = await prisma.session.findMany({
      where: {
        mode: mode as "ranked" | "fun",
        finishedAt: { not: null },
        createdAt: dateFilter,
      },
      include: {
        user: true,
        sessionPhotos: {
          include: {
            guesses: true,
          },
        },
      },
    });

    // Calculate scores for each session
    const sessionScores = sessions.map(session => {
      const totalScore = session.sessionPhotos.reduce((sum, sp) => {
        const sessionScore = sp.guesses.reduce((guessSum, guess) => guessSum + guess.scoreDelta, 0);
        return sum + sessionScore;
      }, 0);
      
      return {
        userId: session.userId,
        userName: session.user.name || "Игрок",
        sessionId: session.id,
        score: totalScore,
        photoCount: session.photoCount,
        finishedAt: session.finishedAt,
        createdAt: session.createdAt,
      };
    });

    // Group by user and get best scores
    const userScores = new Map<string, {
      userId: string;
      userName: string;
      bestScore: number;
      totalSessions: number;
      avgScore: number;
      lastPlayed: Date;
    }>();

    sessionScores.forEach(sessionScore => {
      const existing = userScores.get(sessionScore.userId);
      
      if (!existing) {
        userScores.set(sessionScore.userId, {
          userId: sessionScore.userId,
          userName: sessionScore.userName,
          bestScore: sessionScore.score,
          totalSessions: 1,
          avgScore: sessionScore.score,
          lastPlayed: sessionScore.finishedAt || sessionScore.createdAt,
        });
      } else {
        existing.bestScore = Math.max(existing.bestScore, sessionScore.score);
        existing.totalSessions += 1;
        existing.avgScore = (existing.avgScore * (existing.totalSessions - 1) + sessionScore.score) / existing.totalSessions;
        if (sessionScore.finishedAt && sessionScore.finishedAt > existing.lastPlayed) {
          existing.lastPlayed = sessionScore.finishedAt;
        }
      }
    });

    // Convert to array and sort by best score
    const leaderboard = Array.from(userScores.values())
      .sort((a, b) => b.bestScore - a.bestScore)
      .slice(0, 100); // Top 100

    return NextResponse.json({ 
      leaderboard,
      period,
      mode,
      totalPlayers: userScores.size,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
