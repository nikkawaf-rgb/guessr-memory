import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    // Получаем количество фотографий
    const totalPhotos = await prisma.photo.count();

    // Примерная оценка: средний размер фото ~2 MB
    const estimatedSizeMB = totalPhotos * 2;
    const estimatedSize = estimatedSizeMB >= 1024 
      ? `~${(estimatedSizeMB / 1024).toFixed(2)} GB` 
      : `~${estimatedSizeMB} MB`;

    return NextResponse.json({
      totalPhotos,
      estimatedSize,
    });
  } catch (error) {
    console.error("Error fetching storage info:", error);
    return NextResponse.json(
      { error: "Failed to fetch storage info" },
      { status: 500 }
    );
  }
}

