"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  unlocked: boolean;
}

const rarityColors = {
  common: "from-gray-400 to-gray-500",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 to-orange-500",
};

const rarityNames = {
  common: "Обычное",
  rare: "Редкое",
  epic: "Эпическое",
  legendary: "Легендарное",
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerName, setPlayerName] = useState<string | null>(null);

  useEffect(() => {
    const name = localStorage.getItem("playerName");
    setPlayerName(name);
    loadAchievements(name);
  }, []);

  const loadAchievements = async (name: string | null) => {
    try {
      const url = name 
        ? `/api/achievements?playerName=${encodeURIComponent(name)}`
        : '/api/achievements';
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to load achievements");
      
      const data = await response.json();
      setAchievements(data.achievements);
    } catch (error) {
      console.error("Error loading achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const groupedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const hiddenUnlocked = achievements.filter(a => a.category === 'скрытые' && a.unlocked).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
            🏆 Достижения
          </h1>
          {playerName && (
            <div className="text-center mb-4">
              <p className="text-lg text-gray-700">
                Игрок: <span className="font-bold text-blue-600">{playerName}</span>
              </p>
            </div>
          )}
          <div className="flex justify-center gap-8 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{unlockedCount}</div>
              <div className="text-sm text-gray-600">Получено</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-400">{totalCount}</div>
              <div className="text-sm text-gray-600">Всего</div>
            </div>
            {hiddenUnlocked > 0 && (
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{hiddenUnlocked}</div>
                <div className="text-sm text-gray-600">Скрытых</div>
              </div>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>

        {!playerName && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              💡 <Link href="/auth/simple-signin" className="font-bold underline">Войдите в игру</Link>, чтобы увидеть ваши достижения!
            </p>
          </div>
        )}

        {/* Achievements by category */}
        {Object.entries(groupedAchievements).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 capitalize">
              {category}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((achievement) => {
                // Определяем, что показывать в зависимости от редкости
                const showIcon = achievement.unlocked || achievement.rarity === 'common';
                const showTitle = achievement.unlocked || achievement.rarity === 'common' || achievement.rarity === 'rare' || achievement.rarity === 'epic';
                const showDescription = achievement.unlocked || achievement.rarity === 'common';

                return (
                  <div
                    key={achievement.id}
                    className={`bg-white rounded-lg shadow-lg p-4 border-2 transition-all ${
                      achievement.unlocked
                        ? "border-green-500"
                        : "border-gray-300 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{showIcon ? achievement.icon : "🔒"}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-800">
                            {showTitle ? achievement.title : "???"}
                          </h3>
                          <span
                            className={`text-xs px-2 py-1 rounded text-white bg-gradient-to-r ${
                              rarityColors[achievement.rarity as keyof typeof rarityColors] || rarityColors.common
                            }`}
                          >
                            {rarityNames[achievement.rarity as keyof typeof rarityNames] || rarityNames.common}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {showDescription ? achievement.description : "Достижение скрыто"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Back button */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← На главную
          </Link>
        </div>
      </div>
    </div>
  );
}

