import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getHintForPhoto } from "@/app/lib/scoring";
import { photoIdSchema, validateQueryParams } from "@/app/lib/validation";
import { z } from "zod";

const hintQuerySchema = z.object({
  photoId: photoIdSchema,
  type: z.enum(["location", "date", "people"]),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { photoId, type } = validateQueryParams(hintQuerySchema, searchParams);

    // Get photo data
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: {
        location: true,
        zones: {
          include: {
            person: true,
          },
        },
      },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Generate hint based on type
    const exifDate = photo.exifTakenAt ? new Date(photo.exifTakenAt) : null;
    const hint = getHintForPhoto(
      {
        city: photo.location?.name || "",
        day: exifDate?.getUTCDate() || 0,
        month: exifDate ? exifDate.getUTCMonth() + 1 : 0,
        year: exifDate?.getUTCFullYear() || 0,
        people: photo.zones.map(zone => ({ name: zone.person.displayName })),
      },
      type
    );

    return NextResponse.json({ hint });
  } catch (error) {
    console.error("Error getting hint:", error);
    return NextResponse.json({ error: "Failed to get hint" }, { status: 500 });
  }
}
