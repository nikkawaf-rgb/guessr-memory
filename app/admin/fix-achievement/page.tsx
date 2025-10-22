"use client";

import { useState } from "react";
import Link from "next/link";

export default function FixAchievementPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    achievement: {
      key: string;
      title: string;
      description: string;
      icon: string;
      rarity: string;
    };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFix = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/fix-efd-achievement", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка обновления");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            🔧 Исправление достижения EFD
          </h1>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-yellow-800">
              <strong>Внимание:</strong> Эта страница обновит достижение &quot;Escape from Donbass&quot; в базе данных.
            </p>
          </div>

          <div className="text-center mb-6">
            <button
              onClick={handleFix}
              disabled={loading}
              className={`px-8 py-4 text-white font-bold rounded-lg text-lg transition-colors ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Обновление..." : "🚀 Обновить достижение"}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-800">
                <strong>Ошибка:</strong> {error}
              </p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <h2 className="text-green-800 font-bold mb-2">✅ Успешно обновлено!</h2>
              <div className="text-gray-700 space-y-2">
                <p><strong>Ключ:</strong> {result.achievement.key}</p>
                <p><strong>Название:</strong> {result.achievement.title}</p>
                <p><strong>Описание:</strong> {result.achievement.description}</p>
                <p><strong>Иконка:</strong> {result.achievement.icon}</p>
                <p><strong>Редкость:</strong> {result.achievement.rarity}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-green-200">
                <Link
                  href="/achievements"
                  className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  🏆 Посмотреть достижения
                </Link>
              </div>
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              href="/admin"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ← Вернуться в админку
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

