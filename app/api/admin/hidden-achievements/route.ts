import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// Добавить или обновить скрытое достижение для фото
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photoId, title, description, icon } = body;

    if (!photoId || !title || !description || !icon) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Обновляем фото
    const photo = await prisma.photo.update({
      where: { id: photoId },
      data: {
        hiddenAchievementTitle: title,
        hiddenAchievementDescription: description,
        hiddenAchievementIcon: icon,
      },
    });

    return NextResponse.json({ success: true, photo });
  } catch (error) {
    console.error("Error updating hidden achievement:", error);
    return NextResponse.json(
      { error: "Failed to update hidden achievement" },
      { status: 500 }
    );
  }
}

// Удалить скрытое достижение с фото
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { photoId } = body;

    if (!photoId) {
      return NextResponse.json(
        { error: "Missing photoId" },
        { status: 400 }
      );
    }

    // Убираем скрытое достижение
    const photo = await prisma.photo.update({
      where: { id: photoId },
      data: {
        hiddenAchievementTitle: null,
        hiddenAchievementDescription: null,
        hiddenAchievementIcon: null,
      },
    });

    return NextResponse.json({ success: true, photo });
  } catch (error) {
    console.error("Error removing hidden achievement:", error);
    return NextResponse.json(
      { error: "Failed to remove hidden achievement" },
      { status: 500 }
    );
  }
}

