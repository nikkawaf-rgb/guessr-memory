import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAdmin } from "@/app/lib/auth";
import { validateRequestBody } from "@/app/lib/validation";
import { z } from "zod";

const deletePhotoSchema = z.object({
  photoId: z.string().min(1, "Photo ID is required"),
});

export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate request body
    let body;
    try {
      const requestBody = await request.json();
      body = validateRequestBody(deletePhotoSchema, requestBody);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Invalid request body" },
        { status: 400 }
      );
    }

    // Check if photo exists
    const photo = await prisma.photo.findUnique({
      where: { id: body.photoId },
      include: {
        comments: true,
        sessionPhotos: true,
        guesses: true,
        zones: true,
      },
    });

    if (!photo) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      );
    }

    // Delete related data first
    await prisma.comment.deleteMany({
      where: { photoId: body.photoId },
    });

    await prisma.guess.deleteMany({
      where: { sessionPhotoId: { in: photo.sessionPhotos.map(sp => sp.id) } },
    });

    await prisma.sessionPhoto.deleteMany({
      where: { photoId: body.photoId },
    });

    await prisma.photoPeopleZone.deleteMany({
      where: { photoId: body.photoId },
    });

    // Finally delete the photo
    await prisma.photo.delete({
      where: { id: body.photoId },
    });

    return NextResponse.json({ 
      success: true,
      message: "Photo deleted successfully" 
    });

  } catch (error) {
    console.error("Delete photo error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
