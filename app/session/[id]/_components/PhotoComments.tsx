"use client";

import { useEffect, useState } from "react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  userName: string;
  likesCount: number;
  isLikedByMe: boolean;
}

interface NewAchievement {
  key: string;
  title: string;
  description: string;
  icon: string;
}

interface PhotoCommentsProps {
  photoId: string;
  playerName: string | null;
}

export default function PhotoComments({ photoId, playerName }: PhotoCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newAchievement, setNewAchievement] = useState<NewAchievement | null>(null);

  useEffect(() => {
    loadComments();
  }, [photoId, playerName]);

  const loadComments = async () => {
    try {
      const url = playerName
        ? `/api/comments?photoId=${photoId}&playerName=${encodeURIComponent(playerName)}`
        : `/api/comments?photoId=${photoId}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to load comments");
      
      const data = await response.json();
      setComments(data.comments);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !playerName) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoId,
          playerName,
          content: newComment,
        }),
      });

      if (!response.ok) throw new Error("Failed to post comment");

      const data = await response.json();
      setComments([data.comment, ...comments]);
      setNewComment("");

      // Показать новое достижение, если есть
      if (data.newAchievement) {
        setNewAchievement(data.newAchievement);
        setTimeout(() => setNewAchievement(null), 5000);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Не удалось отправить комментарий");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!playerName) return;

    try {
      const response = await fetch("/api/comments/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          playerName,
        }),
      });

      if (!response.ok) throw new Error("Failed to toggle like");

      const data = await response.json();

      // Обновить список комментариев
      setComments(
        comments.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              likesCount: data.action === "liked" ? c.likesCount + 1 : c.likesCount - 1,
              isLikedByMe: data.action === "liked",
            };
          }
          return c;
        })
      );

      // Показать новое достижение, если есть
      if (data.newAchievement) {
        setNewAchievement(data.newAchievement);
        setTimeout(() => setNewAchievement(null), 5000);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "только что";
    if (diffMins < 60) return `${diffMins} мин назад`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ч назад`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} д назад`;
    
    return date.toLocaleDateString("ru-RU");
  };

  if (!playerName) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600 text-sm">
        Войдите в систему, чтобы видеть и оставлять комментарии
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Achievement notification */}
      {newAchievement && (
        <div className="mb-4 bg-green-50 border-2 border-green-500 rounded-lg p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{newAchievement.icon}</div>
            <div>
              <div className="font-bold text-green-800">🎉 Новое достижение!</div>
              <div className="text-green-700">{newAchievement.title}</div>
              <div className="text-sm text-green-600">{newAchievement.description}</div>
            </div>
          </div>
        </div>
      )}

      <h3 className="font-bold text-gray-800 mb-3">
        💬 Что другие пользователи сказали об этой фотографии?
      </h3>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 text-sm text-yellow-800">
        ⚠️ Спойлеры могут быть полезными, а могут быть специально неправильными!
      </div>

      {/* Comment form */}
      <form onSubmit={handleSubmitComment} className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Оставить свой комментарий..."
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className={`mt-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
            submitting || !newComment.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {submitting ? "Отправка..." : "Отправить комментарий"}
        </button>
      </form>

      {/* Comments list */}
      {loading ? (
        <div className="text-center text-gray-500 py-4">Загрузка комментариев...</div>
      ) : comments.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          Пока нет комментариев. Будьте первым!
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-gray-800">{comment.userName}</div>
                  <div className="text-xs text-gray-500">{formatDate(comment.createdAt)}</div>
                </div>
                <button
                  onClick={() => handleLike(comment.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
                    comment.isLikedByMe
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  <span>{comment.isLikedByMe ? "👍" : "👍🏻"}</span>
                  <span className="text-sm font-semibold">{comment.likesCount}</span>
                </button>
              </div>
              <div className="text-gray-700">{comment.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

