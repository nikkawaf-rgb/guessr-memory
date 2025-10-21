import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {session.finishedAt ? "🎉 Игра завершена!" : "📊 Текущие результаты"}
          </h1>
          <div className="text-6xl font-bold text-blue-600 mb-2">
            {session.totalScore}
          </div>
          <div className="text-gray-600 mb-4">очков</div>
          <div className="text-lg text-gray-700">
            Игрок: <span className="font-semibold">{session.user.name}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {answeredPhotos.filter((sp) => sp.guess?.yearHit).length}
            </div>
            <div className="text-sm text-gray-600">Лет угадано</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {answeredPhotos.filter((sp) => sp.guess?.monthHit).length}
            </div>
            <div className="text-sm text-gray-600">Месяцев угадано</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {answeredPhotos.filter((sp) => sp.guess?.dayHit).length}
            </div>
            <div className="text-sm text-gray-600">Дней угадано</div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Детальные результаты</h2>
          <div className="space-y-4">
            {answeredPhotos.map((sp, index) => {
              const guess = sp.guess!;
              const correctDate = new Date(sp.photo.exifTakenAt!);
              
              return (
                <div key={sp.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-gray-800">
                      Фото {index + 1}
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      +{guess.scoreDelta} очков
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-gray-600">Год:</div>
                      <div className={guess.yearHit ? "text-green-600 font-semibold" : "text-red-600"}>
                        {guess.guessedYear || "—"} {guess.yearHit ? "✓" : "✗"}
                      </div>
                      <div className="text-gray-500 text-xs">
                        Правильно: {correctDate.getFullYear()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Месяц:</div>
                      <div className={guess.monthHit ? "text-green-600 font-semibold" : "text-red-600"}>
                        {guess.guessedMonth || "—"} {guess.monthHit ? "✓" : "✗"}
                      </div>
                      <div className="text-gray-500 text-xs">
                        Правильно: {correctDate.getMonth() + 1}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">День:</div>
                      <div className={guess.dayHit ? "text-green-600 font-semibold" : "text-red-600"}>
                        {guess.guessedDay || "—"} {guess.dayHit ? "✓" : "✗"}
                      </div>
                      <div className="text-gray-500 text-xs">
                        Правильно: {correctDate.getDate()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/"
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-bold text-center hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            На главную
          </Link>
          <Link
            href="/play"
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-lg font-bold text-center hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
          >
            Играть еще
          </Link>
          <Link
            href="/leaderboard"
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 px-6 rounded-lg font-bold text-center hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg"
          >
            Лидерборд
          </Link>
        </div>
      </div>
    </div>
  );
}

