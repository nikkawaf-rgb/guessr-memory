"use server";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

type SubmitGuessInput = {
  sessionId: string;
  sessionPhotoId: string;
  guessedCity?: string;
  guessedDay?: number | null;
  guessedMonth?: number | null;
  guessedYear?: number | null;
  guessedPeopleNames?: string[];
  timeSpentSec?: number | null;
};

export async function submitGuess(input: SubmitGuessInput) {
  const sessionPhoto = await prisma.sessionPhoto.findUnique({
    where: { id: input.sessionPhotoId },
    include: { photo: { include: { location: true, zones: { include: { person: true } } } }, session: true },
  });
  if (!sessionPhoto || sessionPhoto.sessionId !== input.sessionId) return { error: "not-found" } as const;

  // Location check (basic: compare city name to Location.name or its aliases)
  let locationHit = false;
  if (input.guessedCity) {
    const normalized = input.guessedCity.trim().toLowerCase();
    const loc = sessionPhoto.photo.location;
    if (loc) {
      const names = [loc.name, ...(loc.aliases || [])].map((x) => x.toLowerCase());
      locationHit = names.includes(normalized);
    }
  }

  // Date check vs exifTakenAt (admin may override later)
  const exif = sessionPhoto.photo.exifTakenAt ? new Date(sessionPhoto.photo.exifTakenAt) : null;
  const yearHit = !!exif && input.guessedYear != null && exif.getUTCFullYear() === input.guessedYear;
  const monthHit = !!exif && input.guessedMonth != null && exif.getUTCMonth() + 1 === input.guessedMonth;
  const dayHit = !!exif && input.guessedDay != null && exif.getUTCDate() === input.guessedDay;

  // People check (MVP: require exact full set match by names)
  let peopleHitAll = false;
  const targetPeople = (sessionPhoto.photo.zones || []).map((z) => z.person.displayName.toLowerCase());
  const guessPeople = (input.guessedPeopleNames || []).map((n) => n.trim().toLowerCase()).filter(Boolean);
  if (targetPeople.length > 0) {
    const setA = new Set(targetPeople);
    const setB = new Set(guessPeople);
    peopleHitAll = setA.size === setB.size && [...setA].every((n) => setB.has(n));
  }

  const scoreDelta = (peopleHitAll ? 200 : 0) + (locationHit ? 200 : 0) + (yearHit ? 200 : 0) + (monthHit ? 200 : 0) + (dayHit ? 200 : 0);

  await prisma.guess.create({
    data: {
      sessionPhotoId: sessionPhoto.id,
      guessedLocationId: sessionPhoto.photo.locationId ?? null,
      guessedDay: input.guessedDay ?? null,
      guessedMonth: input.guessedMonth ?? null,
      guessedYear: input.guessedYear ?? null,
      guessedPeopleNames: guessPeople,
      timeSpentSec: input.timeSpentSec ?? null,
      peopleHitAll,
      locationHit,
      dayHit,
      monthHit,
      yearHit,
      scoreDelta,
    },
  });

  revalidatePath(`/session/${input.sessionId}`);
  return { ok: true as const, scoreDelta };
}


