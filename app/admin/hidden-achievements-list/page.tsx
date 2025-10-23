"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface HiddenAchievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  userCount: number;
  photoCount: number;
}

export default function HiddenAchievementsListPage() {
  const [achievements, setAchievements] = useState<HiddenAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadAchievements();
  }, []);

  async function loadAchievements() {
    try {
      const res = await fetch("/api/admin/hidden-achievements-list");
      const data = await res.json();
      setAchievements(data.achievements || []);
    } catch (error) {
      console.error("Error loading achievements:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Удалить скрытое достижение "${title}"?\n\nЭто также удалит его у всех игроков, которые его получили!`)) {
      return;
    }

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/hidden-achievements-list?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Достижение удалено!");
        loadAchievements();
      } else {
        const data = await res.json();
        alert(`Ошибка: ${data.error || "Не удалось удалить"}`);
      }
    } catch (error) {
      console.error("Error deleting achievement:", error);
      alert("Ошибка при удалении");
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  const hiddenCategory = achievements.filter(a => a.category === 'скрытые');
  const otherHidden = achievements.filter(a => a.category !== 'скрытые');

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              🔍 Все скрытые достижения в базе
            </h1>
            <Link
              href="/admin"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
            >
              ← Назад в админку
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {hiddenCategory.length}
              </div>
              <div className="text-sm text-gray-600">Категория "скрытые"</div>
            </div>
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {otherHidden.length}
              </div>
              <div className="text-sm text-gray-600">Другие скрытые (isHidden=true)</div>
            </div>
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">
                {achievements.length}
              </div>
              <div className="text-sm text-gray-600">Всего скрытых</div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Внимание:</strong> Удаление достижения удалит его у всех игроков и со всех фото!
              <br />
              Ожидается максимум <strong>8 скрытых достижений</strong> в категории "скрытые".
            </p>
          </div>
        </div>

        {/* Категория "скрытые" */}
        {hiddenCategory.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-purple-700 mb-4">
              👻 Категория "скрытые" ({hiddenCategory.length}/8)
            </h2>
            <div className="space-y-4">
              {hiddenCategory.map((ach) => (
                <div
                  key={ach.id}
                  className="border-2 border-purple-200 rounded-lg p-4 hover:bg-purple-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl">{ach.icon}</span>
                        <div>
                          <div className="text-xl font-bold text-gray-800">
                            {ach.title}
                          </div>
                          <div className="text-sm text-gray-600">
                            {ach.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-500 ml-14">
                        <div>
                          <strong>Key:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{ach.key}</code>
                        </div>
                        <div>
                          <strong>Редкость:</strong> {ach.rarity}
                        </div>
                        <div>
                          <strong>Получили:</strong> {ach.userCount} игрок(ов)
                        </div>
                        <div>
                          <strong>Фото:</strong> {ach.photoCount} шт
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(ach.id, ach.title)}
                      disabled={deleting === ach.id}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition disabled:opacity-50"
                    >
                      {deleting === ach.id ? "⏳" : "🗑️ Удалить"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Другие скрытые достижения */}
        {otherHidden.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">
              🔒 Другие скрытые (isHidden=true, но категория ≠ "скрытые")
            </h2>
            <div className="space-y-4">
              {otherHidden.map((ach) => (
                <div
                  key={ach.id}
                  className="border-2 border-blue-200 rounded-lg p-4 hover:bg-blue-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl">{ach.icon}</span>
                        <div>
                          <div className="text-xl font-bold text-gray-800">
                            {ach.title}
                          </div>
                          <div className="text-sm text-gray-600">
                            {ach.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-500 ml-14">
                        <div>
                          <strong>Key:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{ach.key}</code>
                        </div>
                        <div>
                          <strong>Категория:</strong> {ach.category}
                        </div>
                        <div>
                          <strong>Редкость:</strong> {ach.rarity}
                        </div>
                        <div>
                          <strong>Получили:</strong> {ach.userCount} игрок(ов)
                        </div>
                        <div>
                          <strong>Фото:</strong> {ach.photoCount} шт
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(ach.id, ach.title)}
                      disabled={deleting === ach.id}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition disabled:opacity-50"
                    >
                      {deleting === ach.id ? "⏳" : "🗑️ Удалить"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {achievements.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center text-gray-500">
            Скрытых достижений не найдено
          </div>
        )}
      </div>
    </div>
  );
}

