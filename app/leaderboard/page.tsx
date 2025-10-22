"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Achievement {
  icon: string;
  title: string;
  description: string;
  rarity: string;
  category: string;
}

interface LeaderboardEntry {
  rank: number;
  userName: string;
  totalScore: number;
  finishedAt: string;
  sessionId: string;
  achievements: Achievement[];
  hiddenAchievementsCount: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard");
      if (!response.ok) throw new Error("Failed to load leaderboard");
      const data = await response.json();
      setEntries(data.entries);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8 text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Лидерборд</h1>
          <p className="text-gray-600">Лучшие результаты завершенных игр</p>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-8">
          {entries.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">🎮</div>
              <p className="text-gray-600 text-lg mb-6">
                Пока никто не завершил игру
              </p>
              <Link
                href="/play"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Стать первым!
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {entries.map((entry) => (
                <div
                  key={entry.sessionId}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    entry.rank <= 3 ? "bg-amber-50" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center flex-1">
                        <div className="w-12 text-2xl font-bold text-gray-400 mr-4 text-center">
                          {getMedalEmoji(entry.rank) || `#${entry.rank}`}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 text-lg">
                            {entry.userName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(entry.finishedAt)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {entry.totalScore}
                        </div>
                        <div className="text-xs text-gray-500">очков</div>
                      </div>
                    </div>
                    
                    {/* Достижения игрока */}
                    {(entry.achievements.length > 0 || entry.hiddenAchievementsCount > 0) && (
                      <div className="ml-16 flex flex-wrap items-center gap-1">
                        {entry.achievements.slice(0, 5).map((achievement, idx) => (
                          <span
                            key={idx}
                            title={`${achievement.title}: ${achievement.description}`}
                            className="text-lg"
                          >
                            {achievement.icon}
                          </span>
                        ))}
                        {entry.hiddenAchievementsCount > 0 && (
                          <span
                            title={`Скрытых достижений: ${entry.hiddenAchievementsCount}`}
                            className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold"
                          >
                            🎖️ {entry.hiddenAchievementsCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/"
            className="flex-1 bg-gray-500 text-white py-4 px-6 rounded-lg font-bold text-center hover:bg-gray-600 transition-colors shadow-lg"
          >
            На главную
          </Link>
          <Link
            href="/play"
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-bold text-center hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            Играть
          </Link>
        </div>
      </div>
    </div>
  );
}
