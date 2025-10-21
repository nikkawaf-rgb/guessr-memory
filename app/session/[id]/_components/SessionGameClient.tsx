"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  const router = useRouter();

  const getPhotoUrl = (storagePath: string) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jdrsmlnngkniwgwdrnok.supabase.co";
    const cleanPath = storagePath.replace(/^photos\//, "");
    return `${supabaseUrl}/storage/v1/object/public/photos/${cleanPath}`;
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

      // Перезагружаем страницу чтобы получить следующее фото
      router.refresh();
    } catch (error) {
      console.error("Error submitting guess:", error);
      alert("Ошибка при отправке ответа");
    } finally {
      setLoading(false);
    }
  };

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
              priority
            />
          </div>
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
              💡 Очки: Год = 100 • Месяц = 200 • День = 300 • Комбо (всё) = 1000
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
