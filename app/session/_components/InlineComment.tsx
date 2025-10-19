"use client";
import { useState } from "react";

interface InlineCommentProps {
  photoId: string;
}

export default function InlineComment({ photoId }: InlineCommentProps) {
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/comments/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoId,
          content: content.trim(),
          authorName: authorName.trim() || undefined,
        }),
      });

      if (response.ok) {
        setContent("");
        setAuthorName("");
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
      <h3 className="text-sm font-semibold text-blue-800 mb-3">
        💬 Оставить комментарий к фото
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            placeholder="Ваше имя (необязательно)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            maxLength={50}
          />
        </div>
        
        <div>
          <textarea
            placeholder="Поделитесь мыслями о фото... (не раскрывайте ответы!)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none"
            rows={3}
            maxLength={200}
            disabled={submitting}
          />
          <div className="text-xs text-gray-500 mt-1">
            {content.length}/200 символов
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-orange-600">
            ⚠️ Не раскрывайте ответы в комментариях!
          </div>
          
          <button
            type="submit"
            disabled={!content.trim() || submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {submitting ? "Отправка..." : "Отправить"}
          </button>
        </div>
      </form>
      
      {submitted && (
        <div className="mt-3 text-sm text-green-600">
          ✅ Комментарий отправлен! Он появится на странице фото после игры.
        </div>
      )}
    </div>
  );
}
