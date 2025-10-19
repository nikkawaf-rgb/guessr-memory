import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAdmin } from "@/app/lib/auth";
import { validateRequestBody } from "@/app/lib/validation";
import { z } from "zod";

const bulkImportSchema = z.object({
  storagePath: z.string().min(1),
  originalName: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string().min(1),
});

export async function POST(request: NextRequest) {
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
      body = validateRequestBody(bulkImportSchema, requestBody);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Invalid request body" },
        { status: 400 }
      );
    }

    // Check if photo already exists
    const existingPhoto = await prisma.photo.findFirst({
      where: { storagePath: body.storagePath },
    });

    if (existingPhoto) {
      return NextResponse.json(
        { error: "Photo already exists" },
        { status: 409 }
      );
    }

    // Create photo record
    const photo = await prisma.photo.create({
      data: {
        storagePath: body.storagePath,
        originalName: body.originalName,
        fileSize: body.fileSize,
        mimeType: body.mimeType,
        isActive: true,
        // We'll set these later when admin adds metadata
        exifTakenAt: null,
        exifLocation: null,
        exifCamera: null,
        exifSettings: null,
      },
    });

    return NextResponse.json({ 
      success: true, 
      photoId: photo.id,
      message: "Photo imported successfully" 
    });

  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
