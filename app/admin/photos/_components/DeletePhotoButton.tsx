"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeletePhotoButtonProps {
  photoId: string;
}

export default function DeletePhotoButton({ photoId }: DeletePhotoButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch("/api/admin/photos/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
        return;
      }

      // Refresh the page to update the list
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Ошибка при удалении фотографии");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-red-400">Удалить фото?</p>
        <div className="flex gap-1">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? "..." : "Да"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="bg-gray-600 text-white text-xs px-2 py-1 rounded hover:bg-gray-700"
          >
            Нет
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
    >
      Удалить
    </button>
  );
}
