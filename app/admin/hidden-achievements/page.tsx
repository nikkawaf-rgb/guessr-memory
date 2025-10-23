"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Photo {
  id: string;
  storagePath: string;
  exifTakenAt: Date | null;
  width: number | null;
  height: number | null;
  hiddenAchievementTitle: string | null;
  hiddenAchievementDescription: string | null;
  hiddenAchievementIcon: string | null;
}

interface HiddenAchievementSummary {
  title: string;
  description: string;
  icon: string;
  photoCount: number;
}

export default function HiddenAchievementsPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");

  const getPhotoUrl = (storagePath: string) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jdrsmlnngkniwgwdrnok.supabase.co";
    return `${supabaseUrl}/storage/v1/object/public/photos/${storagePath}`;
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch("/api/admin/photos");
      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (photo: Photo) => {
    setEditingId(photo.id);
    setTitle(photo.hiddenAchievementTitle || "");
    setDescription(photo.hiddenAchievementDescription || "");
    setIcon("👻"); // Всегда привидение
  };

  const handleSave = async (photoId: string) => {
    try {
      const response = await fetch("/api/admin/hidden-achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoId,
          title: title.trim(),
          description: description.trim(),
          icon: icon.trim(),
        }),
      });

      if (response.ok) {
        await fetchPhotos();
        setEditingId(null);
        setTitle("");
        setDescription("");
        setIcon("");
      } else {
        alert("Ошибка при сохранении");
      }
    } catch (error) {
      console.error("Error saving achievement:", error);
      alert("Ошибка при сохранении");
    }
  };

  const handleRemove = async (photoId: string) => {
    try {
      const response = await fetch("/api/admin/hidden-achievements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId }),
      });

      if (response.ok) {
        await fetchPhotos();
      } else {
        alert("Ошибка при удалении");
      }
    } catch (error) {
      console.error("Error removing achievement:", error);
      alert("Ошибка при удалении");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setIcon("");
  };

  // Получить список уникальных скрытых достижений
  const getHiddenAchievementsSummary = (): HiddenAchievementSummary[] => {
    const map = new Map<string, HiddenAchievementSummary>();
    
    photos.forEach((photo) => {
      if (photo.hiddenAchievementTitle) {
        const existing = map.get(photo.hiddenAchievementTitle);
        if (existing) {
          existing.photoCount++;
        } else {
          map.set(photo.hiddenAchievementTitle, {
            title: photo.hiddenAchievementTitle,
            description: photo.hiddenAchievementDescription || "",
            icon: photo.hiddenAchievementIcon || "👻",
            photoCount: 1,
          });
        }
      }
    });
    
    return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
  };

  const hiddenAchievements = getHiddenAchievementsSummary();
  const photosWithAchievements = photos.filter(p => p.hiddenAchievementTitle).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🎖️ Скрытые достижения для фото</h1>
          <Link
            href="/admin"
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition"
          >
            ← Назад в админку
          </Link>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            💡 <strong>Как это работает:</strong> Когда игрок набирает <strong>500+ очков</strong> на фото со скрытым достижением, он получает это уникальное достижение! Несколько фото могут иметь одинаковое название — достижение выдастся только один раз.
          </p>
        </div>

        {/* Статистика и список созданных достижений */}
        {hiddenAchievements.length > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                🎖️ Созданные скрытые достижения ({hiddenAchievements.length} из 8)
              </h2>
              <div className="text-sm text-gray-700 bg-white px-4 py-2 rounded-lg border border-purple-200">
                📸 Фото с достижениями: <strong>{photosWithAchievements}</strong> из <strong>{photos.length}</strong>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hiddenAchievements.map((achievement) => (
                <div
                  key={achievement.title}
                  className="bg-white border-2 border-purple-200 rounded-lg p-4 hover:shadow-lg transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-lg truncate">
                        {achievement.title}
                      </div>
                      <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {achievement.description}
                      </div>
                      <div className="text-xs text-purple-600 font-medium mt-2">
                        📸 Привязано к {achievement.photoCount} {achievement.photoCount === 1 ? 'фото' : 'фотографиям'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {photos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">Нет загруженных фотографий</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                  photo.hiddenAchievementTitle ? "border-2 border-yellow-400" : ""
                }`}
              >
                <div className="relative h-48 bg-gray-200">
                  <Image
                    src={getPhotoUrl(photo.storagePath)}
                    alt="Фото"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="p-4">
                  {/* Информация о фото */}
                  <div className="text-sm text-gray-600 mb-3">
                    {photo.exifTakenAt
                      ? new Date(photo.exifTakenAt).toLocaleDateString("ru-RU")
                      : "Дата неизвестна"}
                    {photo.width && photo.height && (
                      <span className="ml-2">• {photo.width}×{photo.height}</span>
                    )}
                  </div>

                  {/* Существующее достижение */}
                  {photo.hiddenAchievementTitle && editingId !== photo.id && (
                    <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <div className="text-2xl">{photo.hiddenAchievementIcon || "👻"}</div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900">{photo.hiddenAchievementTitle}</div>
                          <div className="text-sm text-gray-800 font-medium">{photo.hiddenAchievementDescription}</div>
                          <div className="text-xs text-purple-600 mt-1">🎖️ Скрытое достижение присвоено</div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleEdit(photo)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          ✏️ Изменить
                        </button>
                        <button
                          onClick={() => handleRemove(photo.id)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          🗑️ Удалить
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Форма редактирования */}
                  {editingId === photo.id && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">
                          Иконка (всегда привидение 👻)
                        </label>
                        <div className="w-full border-2 border-gray-300 bg-gray-100 rounded px-3 py-2 text-center text-3xl">
                          👻
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">
                          Название
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Например: Точка отсчёта"
                          className="w-full border-2 border-gray-300 rounded px-3 py-2 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">
                          Описание
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Например: Получить максимум на первом фото проекта"
                          className="w-full border-2 border-gray-300 rounded px-3 py-2 min-h-[60px] font-medium"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(photo.id)}
                          disabled={!title.trim() || !description.trim() || !icon.trim()}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded font-medium"
                        >
                          ✓ Сохранить
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded font-medium"
                        >
                          ✗ Отмена
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Кнопка добавления */}
                  {!photo.hiddenAchievementTitle && editingId !== photo.id && (
                    <button
                      onClick={() => handleEdit(photo)}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      ➕ Добавить скрытое достижение
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

