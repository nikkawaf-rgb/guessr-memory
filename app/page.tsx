"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<{ name: string; id: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("playerName");
    setCurrentUser(null);
    router.push("/auth/simple-signin");
  };

  return (
    <>
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-t-4 border-red-600">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Точка Роста GUESSER</h1>
              <p className="text-gray-700 mt-1 font-medium">Игра на угадывание дат на фотографиях</p>
              {currentUser && (
                <p className="text-lg text-red-600 mt-2 font-bold">
                  👋 С возвращением, {currentUser.name}!
                </p>
              )}
            </div>
            {currentUser && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition"
              >
                Выйти
              </button>
            )}
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Play Game */}
          <Link
            href={currentUser ? "/play" : "/auth/simple-signin"}
            className="bg-red-600 text-white p-8 rounded-xl shadow-xl hover:bg-red-700 transition-all transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">🎮</div>
              <h2 className="text-2xl font-bold mb-2">Играть</h2>
              <p className="text-red-100">
                {currentUser 
                  ? "Начните новую рейтинговую игру и угадывайте даты на фотографиях"
                  : "Войдите, чтобы начать играть"
                }
              </p>
            </div>
          </Link>

          {/* Leaderboard */}
          <Link
            href="/leaderboard"
            className="bg-gray-900 text-white p-8 rounded-xl shadow-xl hover:bg-black transition-all transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold mb-2">Лидерборд</h2>
              <p className="text-gray-300">
                Посмотрите лучшие результаты игроков
              </p>
            </div>
          </Link>

          {/* Upload Photo */}
          <Link
            href={currentUser ? "/upload" : "/auth/simple-signin"}
            className="bg-purple-600 text-white p-8 rounded-xl shadow-xl hover:bg-purple-700 transition-all transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">📷</div>
              <h2 className="text-2xl font-bold mb-2">Загрузить фото</h2>
              <p className="text-purple-100">
                {currentUser
                  ? "Поделитесь своими фотографиями из Точки Роста"
                  : "Войдите, чтобы загружать фото"
                }
              </p>
            </div>
          </Link>
        </div>

        {/* Additional Links */}
        <div className="flex justify-center gap-4 mt-8">
          <Link
            href="/achievements"
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition transform hover:scale-105"
          >
            🏆 Достижения
          </Link>
        </div>

        {/* Rules */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Правила игры</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-red-600 mr-3 font-bold text-xl">•</span>
              <span className="font-bold text-gray-900 text-lg">Вам будет показано 10 фотографий</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-600 mr-3 font-bold text-xl">•</span>
              <span className="font-bold text-gray-900 text-lg">Угадайте дату съемки: год, месяц и день</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-600 mr-3 font-bold text-xl">•</span>
              <span className="font-bold text-gray-900 text-lg">Чем точнее ответ, тем больше очков</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-600 mr-3 font-bold text-xl">•</span>
              <span className="font-bold text-gray-900 text-lg">Завершенные игры попадают в лидерборд</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    {/* Скрытый вход в мини-игру EFD */}
    <div className="fixed bottom-1 right-1 opacity-20 hover:opacity-100 active:opacity-100 transition-opacity">
      <Link href="/efd" aria-label="hidden">
        <span className="text-xs" role="img" aria-label="truck">🚚</span>
      </Link>
    </div>
    </>
  );
}
