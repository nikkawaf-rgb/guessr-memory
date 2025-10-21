"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const adminFlag = localStorage.getItem("isAdmin");
    if (adminFlag === "true") {
      setIsAdmin(true);
    } else {
      router.push("/admin_enter");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    router.push("/");
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">🔧 Админ-панель</h1>
              <p className="text-gray-600 mt-1">Управление фотографиями</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Bulk Upload */}
          <Link
            href="/admin/bulk-import"
            className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">📤</div>
              <h2 className="text-xl font-bold mb-2">Массовая загрузка</h2>
              <p className="text-green-100 text-sm">
                Загрузите несколько фотографий одновременно
              </p>
            </div>
          </Link>

          {/* View Photos */}
          <Link
            href="/admin/photos"
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">🖼️</div>
              <h2 className="text-xl font-bold mb-2">Просмотр фотографий</h2>
              <p className="text-blue-100 text-sm">
                Просмотрите даты и удалите фотографии
              </p>
            </div>
          </Link>

          {/* Stats */}
          <Link
            href="/admin/stats"
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">📊</div>
              <h2 className="text-xl font-bold mb-2">Статистика</h2>
              <p className="text-purple-100 text-sm">
                Общая информация о системе
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8 max-w-6xl mx-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Быстрые действия</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="/"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl mr-3">🏠</span>
              <div>
                <div className="font-semibold text-gray-800">На главную</div>
                <div className="text-sm text-gray-600">Вернуться на сайт</div>
              </div>
            </a>
            <a
              href="/leaderboard"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl mr-3">🏆</span>
              <div>
                <div className="font-semibold text-gray-800">Лидерборд</div>
                <div className="text-sm text-gray-600">Результаты игроков</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
