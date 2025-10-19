"use client";

import { ProfileSkeleton } from "@/app/components/Skeletons";
import { Suspense } from "react";
import { useState, useEffect } from "react";

interface UserProfile {
  id: string;
  name: string;
  title: string | null;
  createdAt: string;
  stats: {
    totalSessions: number;
    totalScore: number;
    bestScore: number;
    avgScore: number;
    totalComments: number;
    totalLikes: number;
    achievements: number;
  };
  recentSessions: Array<{
    id: string;
    mode: string;
    score: number;
    photoCount: number;
    finishedAt: string;
    durationSec?: number;
    photos: Array<{
      id: string;
      location: string;
      score: number;
      hintsUsed: number;
    }>;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    awardedAt: string;
  }>;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get user ID from localStorage
    const storedUserId = localStorage.getItem("memoryKeeperUserId");
    if (storedUserId) {
      setUserId(storedUserId);
      loadProfile(storedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  async function loadProfile(userId: string) {
    try {
      setLoading(true);
      const res = await fetch(`/api/profile?userId=${userId}`);
      if (res.ok) {
        const profileData = await res.json();
        setProfile(profileData);
      }
    } catch (e) {
      console.error("Failed to load profile:", e);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  const formatScore = (score: number) => {
    return score.toLocaleString("ru-RU");
  };

  if (!userId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Профиль</h1>
        <p className="text-gray-500">Начните играть, чтобы создать профиль!</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Профиль</h1>
        <div className="text-center py-8">Загрузка...</div>
      </div>
    );
  }

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Профиль</h1>
        <div className="text-center py-8 text-red-500">
          Ошибка загрузки профиля
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
        {profile.title && (
          <div className="text-xl text-blue-600 font-medium mb-4">
            {profile.title}
          </div>
        )}
        <div className="text-sm text-gray-500">
          Игрок с {formatDate(profile.createdAt)}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-blue-600">{profile.stats.totalSessions}</div>
          <div className="text-sm text-gray-600">Игр</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-green-600">{formatScore(profile.stats.totalScore)}</div>
          <div className="text-sm text-gray-600">Всего очков</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-purple-600">{formatScore(profile.stats.bestScore)}</div>
          <div className="text-sm text-gray-600">Лучший результат</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-orange-600">{formatScore(Math.round(profile.stats.avgScore))}</div>
          <div className="text-sm text-gray-600">Средний результат</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Sessions */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Последние игры</h2>
          {profile.recentSessions.length > 0 ? (
            <div className="space-y-4">
              {profile.recentSessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium">
                        {session.mode === "ranked" ? "Рейтинговый" : "Фан"} режим
                      </div>
                      <div className="text-sm text-gray-600">
                        {session.photoCount} фото • {formatDate(session.finishedAt)}
                        {session.durationSec && (
                          <span> • {Math.round(session.durationSec / 60)} мин</span>
                        )}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {formatScore(session.score)}
                    </div>
                  </div>
                  
                  {/* Photo breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {session.photos.map((photo, index) => (
                      <div key={photo.id} className="bg-gray-50 p-2 rounded">
                        <div className="font-medium">Фото {index + 1}</div>
                        <div className="text-gray-600">{photo.location}</div>
                        <div className="flex justify-between">
                          <span className="text-green-600">{formatScore(photo.score)}</span>
                          {photo.hintsUsed > 0 && (
                            <span className="text-orange-600">💡{photo.hintsUsed}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Пока нет завершенных игр</p>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">
            Достижения ({profile.achievements.length})
          </h2>
          {profile.achievements.length > 0 ? (
            <div className="space-y-3">
              {profile.achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-green-50 rounded">
                  <div className="text-2xl">🏆</div>
                  <div className="flex-1">
                    <div className="font-medium text-green-800">{achievement.title}</div>
                    <div className="text-sm text-green-600">{achievement.description}</div>
                    <div className="text-xs text-green-500">
                      Получено: {formatDate(achievement.awardedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Пока нет достижений</p>
          )}
        </div>
      </div>

      {/* Social Stats */}
      <div className="mt-8 bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Социальная активность</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{profile.stats.totalComments}</div>
            <div className="text-sm text-gray-600">Комментариев</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{profile.stats.totalLikes}</div>
            <div className="text-sm text-gray-600">Лайков получено</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{profile.stats.achievements}</div>
            <div className="text-sm text-gray-600">Достижений</div>
          </div>
        </div>
      </div>
    </div>
  );
}
