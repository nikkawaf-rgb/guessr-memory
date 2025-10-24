"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function UserUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [playerName, setPlayerName] = useState("");
  const [manualDate, setManualDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [newAchievement, setNewAchievement] = useState<{
    title: string;
    description: string;
    icon: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setMessage(null);
      setNewAchievement(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setMessage({ type: "error", text: "Выберите файл" });
      return;
    }

    if (!playerName.trim()) {
      setMessage({ type: "error", text: "Введите ваше имя игрока" });
      return;
    }

    setUploading(true);
    setMessage(null);
    setNewAchievement(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("playerName", playerName.trim());
    if (manualDate) {
      formData.append("manualDate", manualDate);
    }

    try {
      const response = await fetch("/api/upload/user-photo", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message });
        
        if (data.newAchievement) {
          setNewAchievement(data.newAchievement);
        }

        // Сброс формы
        setFile(null);
        setPreviewUrl("");
        setManualDate("");
        
        // Сбросить input file
        const fileInput = document.getElementById("file-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        setMessage({ type: "error", text: data.error || "Ошибка загрузки" });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage({ type: "error", text: "Ошибка соединения с сервером" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              📷 Загрузить фотографию
            </h1>
            <Link
              href="/"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
            >
              ← Назад
            </Link>
          </div>
          <p className="text-gray-600 text-sm">
            Поделитесь вашими фотографиями из Точки Роста! После модерации они появятся в игре.
          </p>
        </div>

        {/* Achievement notification */}
        {newAchievement && (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400 rounded-xl p-6 mb-6 animate-pulse">
            <h3 className="text-2xl font-bold text-center text-amber-800 mb-3">
              🏆 Новое достижение! 🏆
            </h3>
            <div className="bg-white rounded-lg p-4 shadow-md border-2 border-amber-300">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{newAchievement.icon}</div>
                <div className="flex-1">
                  <div className="font-bold text-xl text-gray-800">
                    {newAchievement.title}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {newAchievement.description}
                  </div>
                </div>
                <div className="text-3xl">✨</div>
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              message.type === "success"
                ? "bg-green-100 border border-green-400 text-green-800"
                : message.type === "error"
                ? "bg-red-100 border border-red-400 text-red-800"
                : "bg-blue-100 border border-blue-400 text-blue-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Upload form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Player name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ваше имя игрока
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Введите имя, под которым вы играете"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Используйте то же имя, что и в игре, иначе достижения не засчитаются
              </p>
            </div>

            {/* File input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Выберите фотографию
              </label>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                📸 Максимум 10MB. Форматы: JPG, PNG, WEBP и др.
              </p>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Предпросмотр:
                </p>
                <div className="relative w-full h-64">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-contain rounded"
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                </div>
              </div>
            )}

            {/* Manual date (optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Дата фотографии (опционально)
              </label>
              <input
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                📅 Если система не сможет определить дату автоматически из EXIF, укажите её вручную
              </p>
            </div>

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                ℹ️ Важная информация
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • Фотография будет отправлена на <strong>модерацию</strong>
                </li>
                <li>
                  • После одобрения она появится в игре для всех игроков
                </li>
                <li>
                  • Загружайте только подходящие фотографии (из Точки Роста, события, мероприятия)
                </li>
                <li>
                  • Неподходящий контент будет отклонён
                </li>
              </ul>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={uploading || !file || !playerName.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "⏳ Загрузка..." : "📤 Загрузить фотографию"}
            </button>
          </form>
        </div>

        {/* Link to home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            🏠 Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}

