"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Memory Keeper</h1>
              <p className="text-gray-600 mt-1">Игра на угадывание дат на фотографиях</p>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Play Game */}
          <Link
            href="/auth/simple-signin"
            className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">🎮</div>
              <h2 className="text-2xl font-bold mb-2">Играть</h2>
              <p className="text-blue-100">
                Начните новую рейтинговую игру и угадывайте даты на фотографиях
              </p>
            </div>
          </Link>

          {/* Leaderboard */}
          <Link
            href="/leaderboard"
            className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold mb-2">Лидерборд</h2>
              <p className="text-amber-100">
                Посмотрите лучшие результаты игроков
              </p>
            </div>
          </Link>
        </div>

        {/* Rules */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Правила игры</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Вам будет показано 10 фотографий
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Угадайте дату съемки: год, месяц и день
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Чем точнее ответ, тем больше очков
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Завершенные игры попадают в лидерборд
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
