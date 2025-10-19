"use server";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { validatePeopleTagging, type GuessedPersonCoord } from "@/app/lib/geometry";
import { checkAndAwardAchievements } from "@/app/lib/achievements";
import { calculateScore } from "@/app/lib/scoring";

type SubmitGuessInput = {
  sessionId: string;
  sessionPhotoId: string;
  guessedCity?: string;
  guessedDay?: number | null;
  guessedMonth?: number | null;
  guessedYear?: number | null;
  guessedPeopleNames?: string[];
  guessedPeopleCoords?: GuessedPersonCoord[];
  hintsUsed?: string[];
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

  // People check with geometry validation
  let peopleHitAll = false;
  const photoZones = (sessionPhoto.photo.zones || []).map(zone => ({
    person: { displayName: zone.person.displayName },
    shapeType: zone.shapeType as "rect" | "circle" | "polygon",
    shapeData: zone.shapeData as Record<string, unknown>,
    tolerancePx: zone.tolerancePx,
  }));
  
  if (photoZones.length > 0 && input.guessedPeopleCoords) {
    const validation = validatePeopleTagging(input.guessedPeopleCoords, photoZones);
    peopleHitAll = validation.allHit;
  } else {
    // Fallback to name-only check if no coordinates provided
    const targetPeople = photoZones.map((z) => z.person.displayName.toLowerCase());
    const guessPeople = (input.guessedPeopleNames || []).map((n) => n.trim().toLowerCase()).filter(Boolean);
    if (targetPeople.length > 0) {
      const setA = new Set(targetPeople);
      const setB = new Set(guessPeople);
      peopleHitAll = setA.size === setB.size && [...setA].every((n) => setB.has(n));
    }
  }

  const scoreDelta = calculateScore(
    {
      guessedCity: input.guessedCity,
      guessedDay: input.guessedDay ?? undefined,
      guessedMonth: input.guessedMonth ?? undefined,
      guessedYear: input.guessedYear ?? undefined,
      guessedPeopleNames: input.guessedPeopleNames,
      timeSpentSec: input.timeSpentSec ?? undefined,
      hintsUsed: input.hintsUsed,
    },
    {
      city: sessionPhoto.photo.location?.name || "",
      day: exif?.getUTCDate() || 0,
      month: exif ? exif.getUTCMonth() + 1 : 0,
      year: exif?.getUTCFullYear() || 0,
      people: photoZones.map(zone => ({ name: zone.person.displayName })),
    },
    sessionPhoto.session.mode
  );

  await prisma.guess.create({
    data: {
      sessionPhotoId: sessionPhoto.id,
      guessedLocationId: sessionPhoto.photo.locationId ?? null,
      guessedDay: input.guessedDay ?? null,
      guessedMonth: input.guessedMonth ?? null,
      guessedYear: input.guessedYear ?? null,
      guessedPeopleNames: input.guessedPeopleNames || [],
      guessedPeopleCoords: input.guessedPeopleCoords || undefined,
      hintsUsed: input.hintsUsed || [],
      timeSpentSec: input.timeSpentSec ?? null,
      peopleHitAll,
      locationHit,
      dayHit,
      monthHit,
      yearHit,
      scoreDelta,
    },
  });

  // Update session progress
  const currentIndex = sessionPhoto.orderIndex;
  const nextIndex = currentIndex + 1;
  
  if (nextIndex >= sessionPhoto.session.photoCount) {
    // Session completed
    await prisma.session.update({
      where: { id: input.sessionId },
      data: { 
        finishedAt: new Date(),
        currentPhotoIndex: nextIndex 
      },
    });
  } else {
    // Move to next photo
    await prisma.session.update({
      where: { id: input.sessionId },
      data: { currentPhotoIndex: nextIndex },
    });
  }

  revalidatePath(`/session/${input.sessionId}`);
  
  // Check for new achievements
  try {
    await checkAndAwardAchievements(sessionPhoto.session.userId);
  } catch (error) {
    console.error("Failed to check achievements:", error);
  }
  
  return { ok: true as const, scoreDelta };
}


