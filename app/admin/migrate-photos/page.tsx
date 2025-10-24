"use client";

import { useState } from "react";

export default function MigratePhotosPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string; message?: string } | null>(null);

  const handleMigrate = async () => {
    if (!confirm("Применить миграцию к базе данных? Это добавит поля для загрузки фото пользователями.")) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/migrate-photos", {
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
          🔧 Миграция: Добавление полей для загрузки фото
        </h1>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-sm text-yellow-800">
            ⚠️ Эта миграция добавит следующие поля в таблицу Photo:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm text-yellow-800">
            <li>uploadedBy (ID пользователя)</li>
            <li>uploaderComment (комментарий от загрузчика)</li>
            <li>moderationStatus (статус модерации)</li>
            <li>moderatedBy (ID модератора)</li>
            <li>moderatedAt (дата модерации)</li>
            <li>rejectionReason (причина отклонения)</li>
          </ul>
        </div>

        <button
          onClick={handleMigrate}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition"
        >
          {loading ? "Применяю миграцию..." : "Применить миграцию"}
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
          <p>💡 После успешного применения миграции эту страницу можно удалить.</p>
        </div>
      </div>
    </div>
  );
}

