"use client";

import { useState } from "react";
import Image from "next/image";
import PhotoComments from "./PhotoComments";

interface GuessResult {
  yearHit: boolean;
  monthHit: boolean;
  dayHit: boolean;
  specialHit: boolean;
  score: number;
  yearScore: number;
  monthScore: number;
  dayScore: number;
  specialScore: number;
  yearDiff: number;
  monthDiff: number;
  dayDiff: number;
  isCombo: boolean;
}

interface SessionGameClientProps {
  session: {
    id: string;
    currentPhotoIndex: number;
    photoCount: number;
    totalScore: number;
  };
  currentPhoto: {
    id: string;
    storagePath: string;
    width: number | null;
    height: number | null;
    specialQuestion: string | null;
    specialAnswerCorrect: string | null;
    uploaderName: string | null;
    uploaderComment: string | null;
  };
  sessionPhotoId: string;
  hasGuess: boolean;
  specialOptions: string[]; // 5 вариантов ответа для спецвопроса
}

export default function SessionGameClient({
  session,
  currentPhoto,
  sessionPhotoId,
  hasGuess,
  specialOptions,
}: SessionGameClientProps) {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [specialAnswer, setSpecialAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<GuessResult | null>(null);
  const [newTotalScore, setNewTotalScore] = useState(session.totalScore);
  const [newAchievement, setNewAchievement] = useState<{
    title: string;
    description: string;
    icon: string;
  } | null>(null);

  const getPhotoUrl = (storagePath: string) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jdrsmlnngkniwgwdrnok.supabase.co";
    // storagePath is just the filename, add the bucket "photos"
    return `${supabaseUrl}/storage/v1/object/public/photos/${storagePath}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/session/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionPhotoId,
          guessedYear: year ? parseInt(year) : null,
          guessedMonth: month ? parseInt(month) : null,
          guessedDay: day ? parseInt(day) : null,
          guessedSpecial: specialAnswer || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit guess");
      }

      const data = await response.json();
      
      // Показываем промежуточный результат
      setResult(data.result);
      setNewTotalScore(data.sessionTotalScore);
      setNewAchievement(data.newAchievement || null);
      setShowResult(true);
    } catch (error) {
      console.error("Error submitting guess:", error);
      alert("Ошибка при отправке ответа");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    // Перезагружаем страницу чтобы получить следующее фото
    window.location.reload();
  };

  // Если показываем результат - рендерим модальное окно
  if (showResult && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-blue-500">
            {/* Заголовок с результатом */}
            <div className="text-center mb-6">
              {result.isCombo ? (
                <div className="mb-4">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-4xl font-bold text-green-600 mb-2">
                    КОМБО!
                  </h2>
                  <p className="text-xl text-gray-700">
                    Вы угадали всё идеально!
                  </p>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="text-5xl mb-4">📊</div>
                  <h2 className="text-3xl font-bold text-blue-600 mb-2">
                    Результат попытки
                  </h2>
                </div>
              )}
            </div>

            {/* Детализация по пунктам */}
            <div className="space-y-4 mb-6">
              {/* Год */}
              <div className={`p-4 rounded-lg border-2 ${
                result.yearHit 
                  ? "bg-green-50 border-green-500" 
                  : "bg-orange-50 border-orange-500"
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-700">Год:</span>
                    {result.yearHit ? (
                      <span className="ml-2 text-green-700 font-bold">✓ Точно!</span>
                    ) : (
                      <span className="ml-2 text-orange-700">
                        Ошибка на {result.yearDiff} {result.yearDiff === 1 ? "год" : result.yearDiff < 5 ? "года" : "лет"}
                      </span>
                    )}
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    +{result.yearScore}
                  </span>
                </div>
              </div>

              {/* Месяц */}
              <div className={`p-4 rounded-lg border-2 ${
                result.monthHit 
                  ? "bg-green-50 border-green-500" 
                  : "bg-orange-50 border-orange-500"
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-700">Месяц:</span>
                    {result.monthHit ? (
                      <span className="ml-2 text-green-700 font-bold">✓ Точно!</span>
                    ) : (
                      <span className="ml-2 text-orange-700">
                        Ошибка на {result.monthDiff} {result.monthDiff === 1 ? "месяц" : result.monthDiff < 5 ? "месяца" : "месяцев"}
                      </span>
                    )}
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    +{result.monthScore}
                  </span>
                </div>
              </div>

              {/* День */}
              <div className={`p-4 rounded-lg border-2 ${
                result.dayHit 
                  ? "bg-green-50 border-green-500" 
                  : "bg-orange-50 border-orange-500"
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-700">День:</span>
                    {result.dayHit ? (
                      <span className="ml-2 text-green-700 font-bold">✓ Точно!</span>
                    ) : (
                      <span className="ml-2 text-orange-700">
                        Ошибка на {result.dayDiff} {result.dayDiff === 1 ? "день" : result.dayDiff < 5 ? "дня" : "дней"}
                      </span>
                    )}
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    +{result.dayScore}
                  </span>
                </div>
              </div>

              {/* Спецвопрос (если был) */}
              {currentPhoto.specialQuestion && (
                <div className={`p-4 rounded-lg border-2 ${
                  result.specialHit 
                    ? "bg-purple-50 border-purple-500" 
                    : "bg-gray-50 border-gray-500"
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-gray-700">🌟 Бонус:</span>
                      {result.specialHit ? (
                        <span className="ml-2 text-purple-700 font-bold">✓ Верно!</span>
                      ) : (
                        <span className="ml-2 text-gray-700">Неверно</span>
                      )}
                    </div>
                    <span className="text-2xl font-bold text-purple-600">
                      +{result.specialScore}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Итого */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold">За эту попытку:</span>
                <span className="text-4xl font-bold">+{result.score}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/30">
                <span className="text-lg font-semibold">Общий счёт:</span>
                <span className="text-3xl font-bold">{newTotalScore}</span>
              </div>
            </div>

            {/* Новое достижение */}
            {newAchievement && (
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400 rounded-xl p-6 mb-6 animate-pulse">
                <h3 className="text-2xl font-bold text-center text-amber-800 mb-3">
                  🏆 Новое достижение! 🏆
                </h3>
                <div className="bg-white rounded-lg p-4 shadow-md border-2 border-amber-300">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{newAchievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-bold text-xl text-gray-800">
                        {newAchievement.title}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {newAchievement.description}
                      </div>
                    </div>
                    <div className="text-3xl">✨</div>
                  </div>
                </div>
              </div>
            )}

            {/* Кнопка продолжить */}
            <button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl font-bold text-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
            >
              Продолжить →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Фото {session.currentPhotoIndex + 1} из {session.photoCount}
            </span>
            <span className="text-sm font-semibold text-blue-600">
              Счет: {session.totalScore}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${((session.currentPhotoIndex + 1) / session.photoCount) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Photo */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-6">
          <div className="relative w-full" style={{ paddingBottom: "75%" }}>
            <Image
              src={getPhotoUrl(currentPhoto.storagePath)}
              alt="Guess the date"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              priority
            />
          </div>
          {/* Uploader attribution and description */}
          {(currentPhoto.uploaderName || currentPhoto.uploaderComment) && (
            <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-200">
              {currentPhoto.uploaderName && (
                <p className="text-sm text-purple-800 text-center font-semibold mb-1">
                  📷 Фото загружено игроком: {currentPhoto.uploaderName}
                </p>
              )}
              {currentPhoto.uploaderComment && (
                <p className="text-sm text-purple-900 text-center italic">
                  &ldquo;{currentPhoto.uploaderComment}&rdquo;
                </p>
              )}
            </div>
          )}
        </div>

        {/* Guess Form */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Когда была сделана эта фотография?
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Day */}
              <div>
                <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-2">
                  День
                </label>
                <input
                  id="day"
                  name="day"
                  type="number"
                  min="1"
                  max="31"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  placeholder="1-31"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Month */}
              <div>
                <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
                  Месяц
                </label>
                <select
                  id="month"
                  name="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Выберите</option>
                  <option value="1">Январь</option>
                  <option value="2">Февраль</option>
                  <option value="3">Март</option>
                  <option value="4">Апрель</option>
                  <option value="5">Май</option>
                  <option value="6">Июнь</option>
                  <option value="7">Июль</option>
                  <option value="8">Август</option>
                  <option value="9">Сентябрь</option>
                  <option value="10">Октябрь</option>
                  <option value="11">Ноябрь</option>
                  <option value="12">Декабрь</option>
                </select>
              </div>

              {/* Year */}
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                  Год
                </label>
                <input
                  id="year"
                  name="year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="Год"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            {/* Special Question */}
            {currentPhoto.specialQuestion && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg">
                <h3 className="text-lg font-bold text-purple-800 mb-3">
                  🌟 Бонусный вопрос (+1000 очков!)
                </h3>
                <p className="text-gray-800 mb-4">{currentPhoto.specialQuestion}</p>
                <div className="space-y-2">
                  {specialOptions.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        specialAnswer === option
                          ? "border-purple-500 bg-purple-100"
                          : "border-gray-300 hover:border-purple-300 hover:bg-purple-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="special"
                        value={option}
                        checked={specialAnswer === option}
                        onChange={(e) => setSpecialAnswer(e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-gray-800">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || hasGuess}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Отправка..." : hasGuess ? "Уже отвечено" : "Отправить ответ"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              💡 Чем точнее ответ, тем больше очков! Макс: Год=100 • Месяц=200 • День=300 • Комбо (всё)=1000
            </p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-6">
          <PhotoComments 
            photoId={currentPhoto.id} 
            playerName={typeof window !== 'undefined' ? localStorage.getItem('playerName') : null}
          />
        </div>
      </div>
    </div>
  );
}
