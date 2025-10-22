"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function StorageInfoPage() {
  const [stats, setStats] = useState<{
    totalPhotos: number;
    estimatedSize: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch("/api/admin/storage-info");
      if (!response.ok) throw new Error("Failed to load stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error loading storage stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            💾 Информация о хранилище
          </h1>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Загрузка...</p>
            </div>
          ) : stats ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
                <h2 className="text-2xl font-bold text-blue-900 mb-4">
                  📊 Статистика фотографий
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded shadow">
                    <p className="text-gray-600 text-sm">Всего фотографий</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalPhotos}</p>
                  </div>
                  <div className="bg-white p-4 rounded shadow">
                    <p className="text-gray-600 text-sm">Примерный размер</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.estimatedSize}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-6">
                <h2 className="text-xl font-bold text-green-900 mb-3">
                  📦 Лимиты Supabase (Free Plan)
                </h2>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span><strong>Storage:</strong> 1 GB бесплатно</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span><strong>Database:</strong> 500 MB бесплатно</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span><strong>Bandwidth:</strong> 2 GB в месяц бесплатно</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
                <h2 className="text-xl font-bold text-yellow-900 mb-3">
                  ℹ️ Как проверить точное использование?
                </h2>
                <ol className="space-y-2 text-gray-700 list-decimal list-inside">
                  <li>Зайдите на <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Dashboard</a></li>
                  <li>Откройте ваш проект</li>
                  <li>Перейдите в раздел <strong>Storage</strong> → <strong>photos</strong></li>
                  <li>Справа вверху увидите точный размер использованного пространства</li>
                  <li>Или перейдите в <strong>Settings</strong> → <strong>Usage</strong> для детальной статистики</li>
                </ol>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-6">
                <h2 className="text-xl font-bold text-purple-900 mb-3">
                  💡 Рекомендации
                </h2>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span>При достижении 800-900 MB рассмотрите возможность удаления старых/ненужных фото</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span>Оптимизируйте размер фото перед загрузкой (рекомендуется до 1-2 MB на фото)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span>Платный план Pro (от $25/мес) даёт 100 GB хранилища</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-red-600">Не удалось загрузить статистику</p>
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              href="/admin"
              className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Вернуться в админку
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

