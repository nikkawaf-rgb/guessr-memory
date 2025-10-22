import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { checkAndGrantAchievements } from "@/app/lib/achievements";

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;

  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      user: true,
      sessionPhotos: {
        include: {
          photo: true,
          guess: true,
        },
        orderBy: {
          orderIndex: "asc",
        },
      },
    },
  });

  if (!session) {
    notFound();
  }

  const answeredPhotos = session.sessionPhotos.filter((sp) => sp.guess);

  // Проверяем и начисляем достижения, если игра завершена
  let newAchievements: string[] = [];
  let achievementDetails: Array<{ title: string; description: string; icon: string }> = [];
  
  if (session.finishedAt && session.durationSeconds) {
    // Подготавливаем данные для проверки достижений
    const stats = {
      sessionId: session.id,
      userId: session.userId,
      totalScore: session.totalScore,
      guesses: answeredPhotos.map((sp) => ({
        yearHit: sp.guess!.yearHit,
        monthHit: sp.guess!.monthHit,
        dayHit: sp.guess!.dayHit,
        specialHit: sp.guess!.specialHit,
        scoreDelta: sp.guess!.scoreDelta,
        guessedYear: sp.guess!.guessedYear,
        guessedMonth: sp.guess!.guessedMonth,
        guessedDay: sp.guess!.guessedDay,
        photo: {
          id: sp.photo.id,
          exifTakenAt: sp.photo.exifTakenAt,
          hiddenAchievementTitle: sp.photo.hiddenAchievementTitle,
          hiddenAchievementDescription: sp.photo.hiddenAchievementDescription,
          hiddenAchievementIcon: sp.photo.hiddenAchievementIcon,
        },
      })),
      durationSeconds: session.durationSeconds,
      createdAt: session.createdAt,
    };

    // Проверяем достижения
    newAchievements = await checkAndGrantAchievements(stats);

    // Получаем детали достижений для отображения
    if (newAchievements.length > 0) {
      const achievements = await prisma.achievement.findMany({
        where: {
          key: { in: newAchievements },
        },
      });
      achievementDetails = achievements.map((a) => ({
        title: a.title,
        description: a.description,
        icon: a.icon,
      }));
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8 text-center border-t-4 border-red-600">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {session.finishedAt ? "🎉 Игра завершена!" : "📊 Текущие результаты"}
          </h1>
          <div className="text-6xl font-bold text-red-600 mb-2">
            {session.totalScore}
          </div>
          <div className="text-gray-700 mb-4 font-medium">очков</div>
          <div className="text-lg text-gray-900">
            Игрок: <span className="font-bold">{session.user.name}</span>
          </div>
        </div>

        {/* New Achievements */}
        {achievementDetails.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400 rounded-lg shadow-xl p-6 mb-8">
            <h2 className="text-3xl font-bold text-center text-amber-800 mb-4">
              🏆 Новые достижения! 🏆
            </h2>
            <div className="space-y-3">
              {achievementDetails.map((achievement, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 shadow-md border-2 border-amber-300 hover:scale-105 transition-transform"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-gray-800">
                        {achievement.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        {achievement.description}
                      </div>
                    </div>
                    <div className="text-2xl">✨</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {answeredPhotos.filter((sp) => sp.guess?.yearHit).length}
            </div>
            <div className="text-sm text-gray-800 font-medium">Лет угадано</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {answeredPhotos.filter((sp) => sp.guess?.monthHit).length}
            </div>
            <div className="text-sm text-gray-800 font-medium">Месяцев угадано</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {answeredPhotos.filter((sp) => sp.guess?.dayHit).length}
            </div>
            <div className="text-sm text-gray-800 font-medium">Дней угадано</div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Детальные результаты</h2>
          <div className="space-y-4">
            {answeredPhotos.map((sp, index) => {
              const guess = sp.guess!;
              
              return (
                <div key={sp.id} className="border-2 border-gray-300 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-gray-900 text-lg">
                      Фото {index + 1}
                    </div>
                    <div className="text-xl font-bold text-red-600">
                      +{guess.scoreDelta} очков
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-base">
                      <div>
                        <span className="text-gray-900 font-bold">Год: </span>
                        <span className={guess.yearHit ? "text-green-600 font-bold text-lg" : "text-gray-500 font-bold"}>
                          {guess.yearHit ? "✓" : "✗"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-900 font-bold">Месяц: </span>
                        <span className={guess.monthHit ? "text-green-600 font-bold text-lg" : "text-gray-500 font-bold"}>
                          {guess.monthHit ? "✓" : "✗"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-900 font-bold">День: </span>
                        <span className={guess.dayHit ? "text-green-600 font-bold text-lg" : "text-gray-500 font-bold"}>
                          {guess.dayHit ? "✓" : "✗"}
                        </span>
                      </div>
                      {sp.photo.specialQuestion && (
                        <div>
                          <span className="text-gray-900 font-bold">Бонус: </span>
                          <span className={guess.specialHit ? "text-purple-600 font-bold text-lg" : "text-gray-500 font-bold"}>
                            {guess.specialHit ? "✓ +1000" : "✗"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/play"
            className="bg-red-600 text-white py-4 px-6 rounded-lg font-bold text-center hover:bg-red-700 transition-all shadow-lg"
          >
            🎮 Играть еще
          </Link>
          <Link
            href="/achievements"
            className="bg-gray-900 text-white py-4 px-6 rounded-lg font-bold text-center hover:bg-black transition-all shadow-lg"
          >
            🏆 Мои достижения
          </Link>
          <Link
            href="/leaderboard"
            className="bg-gray-900 text-white py-4 px-6 rounded-lg font-bold text-center hover:bg-black transition-all shadow-lg"
          >
            🥇 Лидерборд
          </Link>
          <Link
            href="/"
            className="bg-red-600 text-white py-4 px-6 rounded-lg font-bold text-center hover:bg-red-700 transition-all shadow-lg"
          >
            🏠 На главную
          </Link>
        </div>
      </div>
    </div>
  );
}

