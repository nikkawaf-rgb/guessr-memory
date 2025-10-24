"use client";

import { useState } from "react";

export default function SeedContentAchievementsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string; message?: string } | null>(null);

  const handleSeed = async () => {
    if (!confirm("Добавить достижения категории 'Контент' в базу данных?")) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/seed-content-achievements", {
        method: "POST",
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          📷 Добавление достижений за загрузку фото
        </h1>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-sm text-blue-800 font-semibold mb-2">
            Будут добавлены следующие достижения:
          </p>
          <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
            <li>📷 <strong>Фотограф</strong> (common) — Загрузить первую фотографию</li>
            <li>📁 <strong>Архивариус</strong> (common) — Загрузить 5 одобренных фотографий</li>
            <li>🖼️ <strong>Коллекционер</strong> (rare) — Загрузить 10 одобренных фотографий</li>
            <li>📚 <strong>Историк</strong> (epic) — Загрузить 25 одобренных фотографий</li>
            <li>🏛️ <strong>Хранитель памяти</strong> (legendary) — По 1 фото за каждый год (2021-2025)</li>
          </ul>
        </div>

        <button
          onClick={handleSeed}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition"
        >
          {loading ? "Добавляю..." : "Добавить достижения"}
        </button>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
            {result.success ? (
              <div>
                <h2 className="text-lg font-bold text-green-800 mb-2">✅ Успешно!</h2>
                <p className="text-sm text-green-700">{result.message}</p>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-bold text-red-800 mb-2">❌ Ошибка</h2>
                <p className="text-sm text-red-700">{result.error}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p>💡 После добавления достижений эту страницу можно удалить.</p>
          <p className="mt-2">ℹ️ Все достижения категории &quot;Контент&quot; всегда видны игрокам (не скрываются до получения).</p>
        </div>
      </div>
    </div>
  );
}

