"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Stats {
  totalPhotos: number;
  photosWithDates: number;
  totalSessions: number;
  completedSessions: number;
  totalPlayers: number;
}

export default function AdminStatsPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const adminFlag = localStorage.getItem("isAdmin");
    if (adminFlag !== "true") {
      router.push("/admin_enter");
      return;
    }
    setIsAdmin(true);
    loadStats();
  }, [router]);

  const loadStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) throw new Error("Failed to load stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
      alert("Ошибка загрузки статистики");
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin === null || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">📊 Статистика</h1>
            <a
              href="/admin"
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Назад
            </a>
          </div>
        </div>

        {stats && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-2">📸</div>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {stats.totalPhotos}
              </div>
              <div className="text-gray-600">Всего фотографий</div>
              <div className="text-sm text-gray-500 mt-2">
                С датами: {stats.photosWithDates}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-2">🎮</div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {stats.totalSessions}
              </div>
              <div className="text-gray-600">Всего игр</div>
              <div className="text-sm text-gray-500 mt-2">
                Завершено: {stats.completedSessions}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-2">👥</div>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {stats.totalPlayers}
              </div>
              <div className="text-gray-600">Всего игроков</div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-2">✅</div>
              <div className="text-3xl font-bold text-amber-600 mb-1">
                {stats.totalSessions > 0
                  ? Math.round((stats.completedSessions / stats.totalSessions) * 100)
                  : 0}
                %
              </div>
              <div className="text-gray-600">Процент завершения игр</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

