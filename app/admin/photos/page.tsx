"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PhotoData {
  id: string;
  storagePath: string;
  originalName: string | null;
  exifTakenAt: string | null;
  width: number | null;
  height: number | null;
  isActive: boolean;
}

export default function AdminPhotosPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleDelete = async (photoId: string) => {
    try {
      const response = await fetch("/api/admin/photos/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId }),
      });

      if (!response.ok) throw new Error("Failed to delete photo");

      // Просто перезагружаем список без уведомления
      loadPhotos();
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Ошибка при удалении фотографии");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Нет даты";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPhotoUrl = (storagePath: string) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jdrsmlnngkniwgwdrnok.supabase.co";
    // storagePath already contains "photos/filename.jpg"
    return `${supabaseUrl}/storage/v1/object/public/${storagePath}`;
  };

  if (isAdmin === null || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">📸 Фотографии</h1>
            <a
              href="/admin"
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Назад
            </a>
          </div>
          <p className="text-gray-600 mt-2">
            Всего фотографий: {photos.length}
          </p>
        </div>

        {photos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">Нет загруженных фотографий</p>
            <a
              href="/admin/bulk-import"
              className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Загрузить фотографии
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative w-full h-64 bg-gray-200">
                  <img
                    src={getPhotoUrl(photo.storagePath)}
                    alt={photo.originalName || "Photo"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <div className="text-sm text-gray-600">Название:</div>
                    <div className="font-semibold text-gray-800 truncate">
                      {photo.originalName || "Без названия"}
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-sm text-gray-600">Дата съемки:</div>
                    <div className="font-semibold text-blue-600">
                      {formatDate(photo.exifTakenAt)}
                    </div>
                  </div>
                  {photo.width && photo.height && (
                    <div className="mb-2">
                      <div className="text-sm text-gray-600">Размер:</div>
                      <div className="text-sm text-gray-800">
                        {photo.width} × {photo.height}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        photo.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {photo.isActive ? "Активна" : "Неактивна"}
                    </span>
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
