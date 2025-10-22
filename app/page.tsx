"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-t-4 border-red-600">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Точка Роста GUESSER</h1>
              <p className="text-gray-700 mt-1 font-medium">Игра на угадывание дат на фотографиях</p>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Play Game */}
          <Link
            href="/auth/simple-signin"
            className="bg-red-600 text-white p-8 rounded-xl shadow-xl hover:bg-red-700 transition-all transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">🎮</div>
              <h2 className="text-2xl font-bold mb-2">Играть</h2>
              <p className="text-red-100">
                Начните новую рейтинговую игру и угадывайте даты на фотографиях
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
        </div>

        {/* Rules */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Правила игры</h3>
          <ul className="space-y-2 text-gray-800">
            <li className="flex items-start">
              <span className="text-red-600 mr-2 font-bold">•</span>
              <span className="font-medium">Вам будет показано 10 фотографий</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-600 mr-2 font-bold">•</span>
              <span className="font-medium">Угадайте дату съемки: год, месяц и день</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-600 mr-2 font-bold">•</span>
              <span className="font-medium">Чем точнее ответ, тем больше очков</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-600 mr-2 font-bold">•</span>
              <span className="font-medium">Завершенные игры попадают в лидерборд</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
