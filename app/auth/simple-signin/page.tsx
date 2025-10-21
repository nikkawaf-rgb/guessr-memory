"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SimpleSignInPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    
    try {
      // Сохраняем имя в localStorage
      localStorage.setItem("playerName", name.trim());
      
      // Перенаправляем на страницу игры
      router.push("/play");
    } catch (error) {
      console.error("Error:", error);
      alert("Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Memory Keeper
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Угадывайте даты на фотографиях
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Ваше имя
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите ваше имя"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              required
              autoFocus
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Вход..." : "Начать игру"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <a
            href="/auth/admin"
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            Войти как администратор
          </a>
        </div>
      </div>
    </div>
  );
}

