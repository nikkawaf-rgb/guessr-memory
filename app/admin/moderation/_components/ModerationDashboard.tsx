"use client";
import { useState, useEffect } from "react";

interface ModerationStats {
  totalReports: number;
  resolvedReports: number;
  pendingReports: number;
  recentReports: number;
  hiddenComments: number;
  totalComments: number;
}

export default function ModerationDashboard() {
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const response = await fetch("/api/admin/moderation-stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-4">Загрузка статистики...</div>;
  }

  if (!stats) {
    return <div className="text-center py-4 text-red-500">Ошибка загрузки статистики</div>;
  }

  const resolutionRate = stats.totalReports > 0 
    ? Math.round((stats.resolvedReports / stats.totalReports) * 100) 
    : 0;

  const hiddenRate = stats.totalComments > 0 
    ? Math.round((stats.hiddenComments / stats.totalComments) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-lg p-6 shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Статистика модерации</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.pendingReports}</div>
          <div className="text-sm text-gray-600">Ожидают рассмотрения</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.resolvedReports}</div>
          <div className="text-sm text-gray-600">Решено</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.recentReports}</div>
          <div className="text-sm text-gray-600">За последние 24ч</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{resolutionRate}%</div>
          <div className="text-sm text-gray-600">Процент решений</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600">{stats.hiddenComments}</div>
          <div className="text-sm text-gray-600">Скрытых комментариев</div>
          <div className="text-xs text-gray-500">({hiddenRate}% от общего числа)</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-600">{stats.totalComments}</div>
          <div className="text-sm text-gray-600">Всего комментариев</div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <button 
          onClick={loadStats}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          Обновить статистику
        </button>
      </div>
    </div>
  );
}
