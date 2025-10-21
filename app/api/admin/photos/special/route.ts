import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photoId, specialQuestion, specialAnswerCorrect } = body;

    if (!photoId) {
      return NextResponse.json(
        { error: "Photo ID is required" },
        { status: 400 }
      );
    }

    // Обновить фото
    await prisma.photo.update({
      where: { id: photoId },
      data: {
        specialQuestion,
        specialAnswerCorrect,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating special question:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update special question", details: errorMessage },
      { status: 500 }
    );
  }
}

