import { prisma } from "@/app/lib/prisma";
import { photoPublicUrl } from "@/app/lib/publicUrl";
import { redirect } from "next/navigation";
import { submitGuess } from "@/app/session/actions";
import React from "react";
import { TaggerField } from "@/app/session/_components/TaggerField";
import HintsComponent from "@/app/session/_components/HintsComponent";

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      sessionPhotos: {
        include: { photo: { include: { zones: { include: { person: true } } } }, guesses: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });
  if (!session) return <div className="p-6">Сессия не найдена</div>;
  
  // Use currentPhotoIndex to find current photo
  const currentPhoto = session.sessionPhotos.find(sp => sp.orderIndex === session.currentPhotoIndex);
  
  if (!currentPhoto) {
    // Session completed or invalid state
    const total = await prisma.guess.aggregate({ _sum: { scoreDelta: true }, where: { sessionPhotoId: { in: session.sessionPhotos.map((s) => s.id) } } });
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Сессия завершена</h1>
        <p className="text-lg">Итоговый счёт: {total._sum.scoreDelta ?? 0}</p>
      </div>
    );
  }

  const currentIndex = session.currentPhotoIndex;
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-sm opacity-70 mb-2">Фото {currentIndex + 1} из {session.photoCount}</div>
      <GuessForm 
        sessionId={session.id} 
        sessionPhotoId={currentPhoto.id} 
        peopleOptions={(currentPhoto.photo.zones || []).map((z) => z.person.displayName)}
        imageSrc={photoPublicUrl(currentPhoto.photo.storagePath)}
        mode={session.mode}
      />
    </div>
  );
}

function GuessForm({ 
  sessionId, 
  sessionPhotoId, 
  peopleOptions, 
  imageSrc,
  mode
}: { 
  sessionId: string; 
  sessionPhotoId: string; 
  peopleOptions: string[];
  imageSrc: string;
  mode: "ranked" | "fun";
}) {
  // Client-side tagging UI + timer (div-based to satisfy ESLint restrictions on require/import)

  async function action(formData: FormData) {
    "use server";
    const guessedCity = String(formData.get("city") || "");
    const guessedYear = formData.get("year") ? Number(formData.get("year")) : null;
    const guessedMonth = formData.get("month") ? Number(formData.get("month")) : null;
    const guessedDay = formData.get("day") ? Number(formData.get("day")) : null;
    const guessedPeopleNames = JSON.parse(String(formData.get("guessedPeopleNames") || "[]"));
    const guessedPeopleCoords = JSON.parse(String(formData.get("guessedPeopleCoords") || "[]"));
    const hintsUsed = JSON.parse(String(formData.get("hintsUsed") || "[]"));
    const timeSpentSec = Number(formData.get("timeSpentSec") || 0) || null;
    await submitGuess({ sessionId, sessionPhotoId, guessedCity, guessedYear, guessedMonth, guessedDay, guessedPeopleNames, guessedPeopleCoords, hintsUsed, timeSpentSec });
    redirect(`/session/${sessionId}`);
  }

  return (
    <form action={action} className="mt-4 space-y-3">
      <HintsComponent 
        photoId={sessionPhotoId} 
        mode={mode} 
        onHintUsed={() => {
          // This will be handled by the client-side component
        }} 
      />
      <TaggerField peopleOptions={peopleOptions} imageSrc={imageSrc} />
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
      <input type="hidden" name="hintsUsed" value="[]" />
      <p className="text-xs opacity-60">Внимание: не оставляйте спойлеры в комментариях к фото для других игроков.</p>
    </form>
  );
}


