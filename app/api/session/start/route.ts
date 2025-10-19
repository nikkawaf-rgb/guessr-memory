import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { startSessionSchema, validateRequestBody } from "@/app/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { mode, userId } = validateRequestBody(startSessionSchema, body);

    // Pick up to 10 random active photos
    const photos = await prisma.photo.findMany({ where: { isActive: true }, take: 200, orderBy: { createdAt: "desc" } });
    console.log(`Found ${photos.length} active photos`);
    
    if (!photos.length) {
      console.error("No photos found in database");
      return NextResponse.json({ error: "No photos available. Please contact admin to upload photos." }, { status: 400 });
    }
    
    const shuffled = [...photos].sort(() => Math.random() - 0.5).slice(0, Math.min(10, photos.length));
    console.log(`Selected ${shuffled.length} photos for session`);

    let user;
    if (userId) {
      // Try to find existing user or create with specific ID
      user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        // Create user with specific ID
        user = await prisma.user.create({ 
          data: { 
            id: userId,
            name: "Игрок" 
          } 
        });
      }
    } else {
      // Create new guest user
      user = await prisma.user.create({ data: { name: "Гость" } });
    }

    const session = await prisma.session.create({
      data: {
        mode,
        photoCount: shuffled.length,
        userId: user.id,
        currentPhotoIndex: 0,
        sessionPhotos: {
          create: shuffled.map((p, idx) => ({ photoId: p.id, orderIndex: idx })),
        },
      },
      include: { sessionPhotos: true },
    });

    return NextResponse.json({ 
      id: session.id, 
      userId: user.id,
      currentPhotoIndex: 0 
    });
  } catch (e: unknown) {
    console.error("Session start error:", e);
    const message = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


