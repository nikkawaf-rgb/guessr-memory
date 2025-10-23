"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface PhotoData {
  id: string;
  storagePath: string;
  originalName: string | null;
  exifTakenAt: string | null;
  specialQuestion: string | null;
  specialAnswerCorrect: string | null;
}

export default function SpecialQuestionsPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const router = useRouter();

  useEffect(() => {
    const adminFlag = localStorage.getItem("isAdmin");
    if (adminFlag !== "true") {
      router.push("/admin_enter");
      return;
    }
    setIsAdmin(true);
    loadPhotos();
  }, [router]);

  const loadPhotos = async () => {
    try {
      const response = await fetch("/api/admin/photos");
      if (!response.ok) throw new Error("Failed to load photos");
      const data = await response.json();
      setPhotos(data.photos);
    } catch (error) {
      console.error("Error loading photos:", error);
      alert("Ошибка загрузки фотографий");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (photo: PhotoData) => {
    setEditingId(photo.id);
    setQuestion(photo.specialQuestion || "");
    setAnswer(photo.specialAnswerCorrect || "");
  };

  const handleSave = async (photoId: string) => {
    try {
      const response = await fetch("/api/admin/photos/special", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoId,
          specialQuestion: question.trim() || null,
          specialAnswerCorrect: answer.trim() || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      setEditingId(null);
      setQuestion("");
      setAnswer("");
      loadPhotos();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Ошибка при сохранении");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setQuestion("");
    setAnswer("");
  };

  const getPhotoUrl = (storagePath: string) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jdrsmlnngkniwgwdrnok.supabase.co";
    // storagePath is just the filename, add the bucket "photos"
    return `${supabaseUrl}/storage/v1/object/public/photos/${storagePath}`;
  };

  const handleRemove = async (photoId: string) => {
    if (!confirm("Удалить спецвопрос с этого фото?")) return;
    
    try {
      const response = await fetch("/api/admin/photos/special", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoId,
          specialQuestion: null,
          specialAnswerCorrect: null,
        }),
      });

      if (!response.ok) throw new Error("Failed to remove");
      
      loadPhotos();
    } catch (error) {
      console.error("Error removing:", error);
      alert("Ошибка при удалении спецвопроса");
    }
  };

  if (isAdmin === null || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const photosWithSpecialQuestions = photos.filter(p => p.specialQuestion).length;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">🌟 Спецвопросы</h1>
              <p className="text-gray-600 mt-2">
                Добавьте бонусные вопросы к фотографиям (+1000 очков за правильный ответ)
              </p>
            </div>
            <a
              href="/admin"
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Назад
            </a>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{photosWithSpecialQuestions}</div>
              <div className="text-sm text-purple-700 font-medium mt-1">Спецвопросов добавлено</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{photos.length - photosWithSpecialQuestions}</div>
              <div className="text-sm text-blue-700 font-medium mt-1">Без спецвопросов</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-gray-600">{photos.length}</div>
              <div className="text-sm text-gray-700 font-medium mt-1">Всего фотографий</div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            💡 <strong>Как это работает:</strong> Вы можете добавить спецвопрос к любому фото.
            В каждой игре из 10 фото будут случайно выбраны 2 позиции для показа спецвопросов.
            Если на выбранной позиции есть спецвопрос - он покажется (+1000 очков).
            Если нет - фото играется как обычное.
          </p>
        </div>

        {photos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">Нет фотографий</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative w-full h-48 bg-gray-200">
                  <Image
                    src={getPhotoUrl(photo.storagePath)}
                    alt={photo.originalName || "Photo"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <div className="mb-2 text-sm text-gray-600">
                    {photo.originalName || "Без названия"}
                  </div>

                  {editingId === photo.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Вопрос:
                        </label>
                        <textarea
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          placeholder="Например: Что изображено на фото?"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Правильный ответ:
                        </label>
                        <input
                          type="text"
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          placeholder="Один правильный вариант"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(photo.id)}
                          className="flex-1 bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
                        >
                          Сохранить
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex-1 bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {photo.specialQuestion ? (
                        <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded">
                          <div className="text-sm font-semibold text-purple-800 mb-1">
                            Вопрос:
                          </div>
                          <div className="text-sm text-gray-800 mb-2">
                            {photo.specialQuestion}
                          </div>
                          <div className="text-sm font-semibold text-purple-800 mb-1">
                            Ответ:
                          </div>
                          <div className="text-sm text-green-700">
                            {photo.specialAnswerCorrect}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-500">
                          Нет спецвопроса
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(photo)}
                          className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
                        >
                          {photo.specialQuestion ? "✏️ Изменить" : "➕ Добавить"}
                        </button>
                        {photo.specialQuestion && (
                          <button
                            onClick={() => handleRemove(photo.id)}
                            className="px-4 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                            title="Удалить спецвопрос"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
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

