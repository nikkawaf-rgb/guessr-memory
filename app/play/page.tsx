"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PlayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function start() {
    try {
      setLoading(true);
      const res = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "ranked" }),
      });
      if (!res.ok) {
        const error = await res.json();
        alert(`Ошибка: ${error.error}`);
        return;
      }
      const { id } = await res.json();
      router.push(`/session/${id}`);
    } catch (e) {
      console.error(e);
      alert("Ошибка при запуске игры");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Играть</h1>
      
      <div className="text-center py-12">
        <div className="mb-8">
          <h2 className="text-xl font-medium mb-4">Memory Keeper</h2>
          <p className="text-gray-600 mb-6">
            Угадайте место, дату и людей на фотографиях из ваших воспоминаний
          </p>
        </div>
        
        <button 
          disabled={loading} 
          onClick={start} 
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? "Запуск игры..." : "🎮 Начать новую игру"}
        </button>
        
        <p className="text-sm text-gray-500 mt-4">
          ⚠️ При выходе из игры ваш прогресс не сохранится
        </p>
      </div>
    </div>
  );
}


