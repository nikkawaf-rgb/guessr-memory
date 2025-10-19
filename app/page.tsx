import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Memory Keeper
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Угадайте людей, места и даты на фотографиях
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Игра в стиле GeoGuessr с галереей фотографий. Тегируйте людей, угадывайте города и даты для получения очков.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Link 
            href="/play" 
            className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow text-center group"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎮</div>
            <h3 className="text-xl font-semibold mb-2">Играть</h3>
            <p className="text-gray-600">Начните новую игру или продолжите существующую сессию</p>
          </Link>

          <Link 
            href="/gallery" 
            className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow text-center group"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🖼️</div>
            <h3 className="text-xl font-semibold mb-2">Галерея</h3>
            <p className="text-gray-600">Просматривайте фотографии и оставляйте комментарии</p>
          </Link>

          <Link 
            href="/leaderboard" 
            className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow text-center group"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏆</div>
            <h3 className="text-xl font-semibold mb-2">Лидерборд</h3>
            <p className="text-gray-600">Смотрите рейтинги лучших игроков</p>
          </Link>

          <Link 
            href="/achievements" 
            className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow text-center group"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎖️</div>
            <h3 className="text-xl font-semibold mb-2">Достижения</h3>
            <p className="text-gray-600">Отслеживайте свои достижения и прогресс</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <Link 
            href="/profile" 
            className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow text-center group"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">👤</div>
            <h3 className="text-xl font-semibold mb-2">Профиль</h3>
            <p className="text-gray-600">Ваша статистика, достижения и история игр</p>
          </Link>

          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold mb-2">Войти / Регистрация</h3>
            <p className="text-gray-600 mb-4">Создайте аккаунт для сохранения прогресса</p>
            <div className="flex gap-2 justify-center">
              <Link 
                href="/auth/signin" 
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
              >
                Войти
              </Link>
              <Link 
                href="/auth/signup" 
                className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
              >
                Регистрация
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-center">Как играть</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-semibold mb-2">Тегируйте людей</h3>
              <p className="text-gray-600">Кликайте на изображение, чтобы отметить людей и выбрать их имена</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">📍</div>
              <h3 className="font-semibold mb-2">Угадайте место</h3>
              <p className="text-gray-600">Введите название города, где была сделана фотография</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">📅</div>
              <h3 className="font-semibold mb-2">Определите дату</h3>
              <p className="text-gray-600">Укажите год, месяц и день съемки</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              <strong>Система очков:</strong> Люди (200), Место (200), Год (200), Месяц (200), День (200) = максимум 1000 очков за фото
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
