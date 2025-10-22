"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SimpleSignInPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Проверяем, есть ли сохраненный пользователь
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      router.push("/");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) return;

    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          password: password.trim(),
          isRegister,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Сохраняем пользователя в localStorage
        localStorage.setItem("currentUser", JSON.stringify({
          name: data.user.name,
          id: data.user.id,
        }));
        localStorage.setItem("playerName", data.user.name);
        
        // Перенаправляем на главную
        router.push("/");
      } else {
        setError(data.error || "Ошибка входа");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Ошибка подключения к серверу");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full border-t-4 border-red-600">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
          Точка Роста GUESSER
        </h1>
        <p className="text-center text-gray-800 mb-8 font-medium">
          {isRegister ? "Регистрация" : "Вход в игру"}
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-800 rounded font-medium">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">
              Имя пользователя
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 font-medium"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-900 mb-2">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ваш пароль"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 font-medium"
              required
            />
            {isRegister && (
              <p className="text-sm text-gray-700 mt-2 font-medium">
                💡 Запомните пароль! Админ сможет помочь его восстановить.
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading || !name.trim() || !password.trim()}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-red-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Загрузка..." : isRegister ? "Зарегистрироваться" : "Войти"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            className="text-sm text-gray-800 hover:text-red-600 transition-colors font-bold"
          >
            {isRegister ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <a
            href="/admin_enter"
            className="text-sm text-gray-700 hover:text-red-600 transition-colors font-medium"
          >
            Войти как администратор
          </a>
        </div>
      </div>
    </div>
  );
}
