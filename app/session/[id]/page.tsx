import { prisma } from "@/app/lib/prisma";
import { photoPublicUrl } from "@/app/lib/publicUrl";
import Image from "next/image";
import { redirect } from "next/navigation";
import { submitGuess } from "@/app/session/actions";
import React from "react";
import { TaggerField } from "@/app/session/_components/TaggerField";

export default async function SessionPage({ params }: { params: { id: string } }) {
  const session = await prisma.session.findUnique({
    where: { id: params.id },
    include: {
      sessionPhotos: {
        include: { photo: { include: { zones: { include: { person: true } } } }, guesses: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });
  if (!session) return <div className="p-6">Сессия не найдена</div>;
  // find first sessionPhoto without guesses
  const current = session.sessionPhotos.find((sp) => sp.guesses.length === 0) || null;
  if (!current) {
    const total = await prisma.guess.aggregate({ _sum: { scoreDelta: true }, where: { sessionPhotoId: { in: session.sessionPhotos.map((s) => s.id) } } });
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Сессия завершена</h1>
        <p className="text-lg">Итоговый счёт: {total._sum.scoreDelta ?? 0}</p>
      </div>
    );
  }

  const currentIndex = session.sessionPhotos.findIndex((sp) => sp.id === (current?.id || ""));
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-sm opacity-70 mb-2">Фото {currentIndex + 1} из {session.photoCount}</div>
      <div className="relative w-full h-auto">
        <Image
          src={photoPublicUrl(current.photo.storagePath)}
          alt="photo"
          width={1200}
          height={800}
          className="w-full h-auto rounded object-contain"
        />
      </div>
      <GuessForm sessionId={session.id} sessionPhotoId={current.id} peopleOptions={(current.photo.zones || []).map((z) => z.person.displayName)} />
    </div>
  );
}

function GuessForm({ sessionId, sessionPhotoId, peopleOptions }: { sessionId: string; sessionPhotoId: string; peopleOptions: string[] }) {
  // Client-side tagging UI + timer (div-based to satisfy ESLint restrictions on require/import)

  async function action(formData: FormData) {
    "use server";
    const guessedCity = String(formData.get("city") || "");
    const guessedYear = formData.get("year") ? Number(formData.get("year")) : null;
    const guessedMonth = formData.get("month") ? Number(formData.get("month")) : null;
    const guessedDay = formData.get("day") ? Number(formData.get("day")) : null;
    const guessedPeopleNames = JSON.parse(String(formData.get("guessedPeopleNames") || "[]"));
    const timeSpentSec = Number(formData.get("timeSpentSec") || 0) || null;
    await submitGuess({ sessionId, sessionPhotoId, guessedCity, guessedYear, guessedMonth, guessedDay, guessedPeopleNames, timeSpentSec });
    redirect(`/session/${sessionId}`);
  }

  return (
    <form action={action} className="mt-4 space-y-3">
      <TaggerField peopleOptions={peopleOptions} />
      <div className="flex gap-2 items-end">
        <div>
          <label className="block text-xs opacity-70">Город</label>
          <input name="city" className="border rounded px-3 py-2" placeholder="Напр. Москва" />
        </div>
        <div>
          <label className="block text-xs opacity-70">Год</label>
          <input name="year" type="number" className="border rounded px-3 py-2 w-24" />
        </div>
        <div>
          <label className="block text-xs opacity-70">Месяц</label>
          <input name="month" type="number" min={1} max={12} className="border rounded px-3 py-2 w-20" />
        </div>
        <div>
          <label className="block text-xs opacity-70">День</label>
          <input name="day" type="number" min={1} max={31} className="border rounded px-3 py-2 w-20" />
        </div>
        <button className="bg-black text-white rounded px-4 py-2">Ответить</button>
      </div>
      <p className="text-xs opacity-60">Внимание: не оставляйте спойлеры в комментариях к фото для других игроков.</p>
    </form>
  );
}


