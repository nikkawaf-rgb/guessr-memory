"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminEnterPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    
    try {
      // Проверяем пароль (просто сравниваем с хардкодом)
      if (password === "neverwalkalone") {
        // Сохраняем флаг админа в localStorage
        localStorage.setItem("isAdmin", "true");
        
        // Перенаправляем в админку
        router.push("/admin");
      } else {
        alert("Неверный пароль");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
      <div className="bg-gray-700 p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">
          🔐 Admin Access
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Пароль администратора
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              autoFocus
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Вернуться на главную
          </a>
        </div>
      </div>
    </div>
  );
}

