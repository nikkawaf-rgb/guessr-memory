"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
  };
  likes: { id: string }[];
}

interface PhotoData {
  id: string;
  storagePath: string;
  originalName: string | null;
  exifTakenAt: string | null;
  width: number | null;
  height: number | null;
  isActive: boolean;
  comments: CommentData[];
  uploadedBy: string | null;
  uploader: { name: string } | null;
  moderationStatus: string;
  moderatedAt: string | null;
  rejectionReason: string | null;
}

export default function AdminPhotosPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
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

  const handleDeleteComment = async (commentId: string, photoId: string) => {
    try {
      const response = await fetch(`/api/admin/comments/delete?id=${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete comment");

      // Обновить список фотографий
      setPhotos(photos.map(p => {
        if (p.id === photoId) {
          return {
            ...p,
            comments: p.comments.filter(c => c.id !== commentId),
          };
        }
        return p;
      }));
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Ошибка удаления комментария");
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

  const handleModerate = async (photoId: string, action: "approve" | "reject", reason?: string) => {
    try {
      const response = await fetch("/api/admin/photos/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, action, reason }),
      });

      if (!response.ok) throw new Error("Failed to moderate photo");

      // Перезагружаем список
      loadPhotos();
    } catch (error) {
      console.error("Error moderating photo:", error);
      alert("Ошибка при модерации фотографии");
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
    // storagePath is just the filename, add the bucket "photos"
    return `${supabaseUrl}/storage/v1/object/public/photos/${storagePath}`;
  };

  if (isAdmin === null || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredPhotos = photos.filter((photo) => {
    if (filter === "all") return true;
    return photo.moderationStatus === filter;
  });

  const pendingCount = photos.filter(p => p.moderationStatus === "pending").length;
  const approvedCount = photos.filter(p => p.moderationStatus === "approved").length;
  const rejectedCount = photos.filter(p => p.moderationStatus === "rejected").length;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">📸 Фотографии</h1>
            <a
              href="/admin"
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Назад
            </a>
          </div>
          <p className="text-gray-600 mb-4">
            Всего фотографий: {photos.length}
          </p>

          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Все ({photos.length})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              ⏳ На модерации ({pendingCount})
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === "approved"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              ✅ Одобренные ({approvedCount})
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === "rejected"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              ❌ Отклонённые ({rejectedCount})
            </button>
          </div>
        </div>

        {filteredPhotos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">
              {photos.length === 0 
                ? "Нет загруженных фотографий"
                : "Нет фотографий в этой категории"
              }
            </p>
            {photos.length === 0 && (
              <a
                href="/admin/bulk-import"
                className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Загрузить фотографии
              </a>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => (
              <div key={photo.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative w-full h-64 bg-gray-200">
                  <Image
                    src={getPhotoUrl(photo.storagePath)}
                    alt={photo.originalName || "Photo"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                  {/* Uploader info */}
                  {photo.uploader && (
                    <div className="mb-2 text-sm">
                      <span className="text-gray-600">Загрузил:</span>{" "}
                      <span className="font-semibold text-purple-600">{photo.uploader.name}</span>
                    </div>
                  )}

                  {/* Moderation status */}
                  <div className="mb-3">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-semibold ${
                        photo.moderationStatus === "approved"
                          ? "bg-green-100 text-green-800"
                          : photo.moderationStatus === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {photo.moderationStatus === "approved" && "✅ Одобрено"}
                      {photo.moderationStatus === "pending" && "⏳ На модерации"}
                      {photo.moderationStatus === "rejected" && "❌ Отклонено"}
                    </span>
                  </div>

                  {/* Rejection reason */}
                  {photo.rejectionReason && (
                    <div className="mb-2 text-sm bg-red-50 border border-red-200 rounded p-2">
                      <span className="text-red-700">Причина: {photo.rejectionReason}</span>
                    </div>
                  )}

                  {/* Moderation buttons */}
                  {photo.moderationStatus === "pending" && (
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => handleModerate(photo.id, "approve")}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 text-sm rounded font-semibold transition"
                      >
                        ✅ Одобрить
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt("Причина отклонения (опционально):");
                          handleModerate(photo.id, "reject", reason || undefined);
                        }}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 text-sm rounded font-semibold transition"
                      >
                        ❌ Отклонить
                      </button>
                    </div>
                  )}

                  {/* Delete button */}
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        photo.isActive
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {photo.isActive ? "В игре" : "Не в игре"}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm("Удалить эту фотографию?")) {
                          handleDelete(photo.id);
                        }
                      }}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                    >
                      🗑️ Удалить
                    </button>
                  </div>

                  {/* Comments Section */}
                  {photo.comments && photo.comments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        💬 Комментарии ({photo.comments.length})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {photo.comments.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 rounded p-2 text-sm">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-semibold text-gray-800">{comment.user.name}</span>
                              <div className="flex gap-2">
                                <span className="text-xs text-gray-500">
                                  👍 {comment.likes.length}
                                </span>
                                <button
                                  onClick={() => handleDeleteComment(comment.id, photo.id)}
                                  className="text-red-500 hover:text-red-700 text-xs"
                                  title="Удалить комментарий"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                            <p className="text-gray-700">{comment.content}</p>
                          </div>
                        ))}
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
