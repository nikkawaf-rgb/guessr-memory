import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const bulkImportSchema = z.object({
  storagePath: z.string().min(1),
  originalName: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string().min(1),
  exifData: z.any().optional(), // EXIF data from client
});

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    let body;
    try {
      const requestBody = await request.json();
      body = bulkImportSchema.parse(requestBody);
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

    // Parse EXIF date if available
    let exifTakenAt: Date | null = null;
    if (body.exifData) {
      try {
        // Try to parse date from various EXIF fields
        const dateString = 
          body.exifData.DateTimeOriginal ||
          body.exifData.DateTime ||
          body.exifData.CreateDate;
        
        if (dateString) {
          // EXIF dates are in format "YYYY:MM:DD HH:MM:SS"
          const parsed = dateString.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
          exifTakenAt = new Date(parsed);
          
          // Validate the date
          if (isNaN(exifTakenAt.getTime())) {
            exifTakenAt = null;
          }
        }
      } catch (error) {
        console.error("Error parsing EXIF date:", error);
      }
    }

    // Create photo record
    const photo = await prisma.photo.create({
      data: {
        storagePath: body.storagePath,
        originalName: body.originalName,
        fileSize: body.fileSize,
        mimeType: body.mimeType,
        isActive: true,
        exifTakenAt,
        exifRaw: body.exifData ? (body.exifData as Prisma.JsonValue) : Prisma.JsonNull,
      },
    });

    return NextResponse.json({ 
      success: true, 
      photoId: photo.id,
      hasDate: !!exifTakenAt,
      message: exifTakenAt 
        ? "Photo imported with EXIF date" 
        : "Photo imported without date (won't be used in game)"
    });

  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
