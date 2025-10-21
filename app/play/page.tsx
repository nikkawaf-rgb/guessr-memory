"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PlayPage() {
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const name = localStorage.getItem("playerName");
    if (!name) {
      router.push("/auth/simple-signin");
      return;
    }
    setPlayerName(name);
  }, [router]);

  const handleStartGame = async () => {
    if (!playerName) return;

    setLoading(true);
    try {
      const response = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Server error:", data);
        alert(data.error || "Ошибка при создании игры. Попробуйте еще раз.");
        return;
      }

      router.push(`/session/${data.sessionId}`);
    } catch (error) {
      console.error("Error starting game:", error);
      alert("Ошибка при создании игры. Проверьте консоль для деталей.");
    } finally {
      setLoading(false);
    }
  };

  if (playerName === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
          Рейтинговая игра
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Угадайте даты на 10 фотографиях и заработайте очки
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            ⚠️ Если вы выйдете из игры до её завершения, ваш прогресс не сохранится
          </p>
        </div>

        <button
          onClick={handleStartGame}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          {loading ? "Подготовка игры..." : "Начать игру"}
        </button>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
          >
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
