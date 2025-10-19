"use client";
import { useState, useEffect } from "react";

interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  achieved: boolean;
  awardedAt: string | null;
}

interface AchievementsData {
  achievements: Achievement[];
  totalAchieved: number;
  totalAvailable: number;
}

export default function AchievementsPage() {
  const [data, setData] = useState<AchievementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get user ID from localStorage
    const storedUserId = localStorage.getItem("memoryKeeperUserId");
    if (storedUserId) {
      setUserId(storedUserId);
      loadAchievements(storedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  async function loadAchievements(userId: string) {
    try {
      setLoading(true);
      const res = await fetch(`/api/achievements?userId=${userId}`);
      if (res.ok) {
        const achievementsData = await res.json();
        setData(achievementsData);
      }
    } catch (e) {
      console.error("Failed to load achievements:", e);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  if (!userId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Достижения</h1>
        <p className="text-gray-500">Начните играть, чтобы получить достижения!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Достижения</h1>
      
      {loading ? (
        <div className="text-center py-8">Загрузка...</div>
      ) : data ? (
        <div>
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <div className="text-lg font-medium">
              Прогресс: {data.totalAchieved} из {data.totalAvailable} достижений
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(data.totalAchieved / data.totalAvailable) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`border rounded-lg p-4 ${
                  achievement.achieved 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className={`font-medium ${
                      achievement.achieved ? 'text-green-800' : 'text-gray-600'
                    }`}>
                      {achievement.title}
                    </div>
                    <div className={`text-sm mt-1 ${
                      achievement.achieved ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {achievement.description}
                    </div>
                    {achievement.achieved && achievement.awardedAt && (
                      <div className="text-xs text-green-500 mt-2">
                        Получено: {formatDate(achievement.awardedAt)}
                      </div>
                    )}
                  </div>
                  <div className={`ml-3 ${
                    achievement.achieved ? 'text-green-500' : 'text-gray-300'
                  }`}>
                    {achievement.achieved ? (
                      <div className="text-2xl">🏆</div>
                    ) : (
                      <div className="text-2xl">🔒</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-red-500">
          Ошибка загрузки достижений
        </div>
      )}
    </div>
  );
}
