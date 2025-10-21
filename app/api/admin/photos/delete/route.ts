import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photoId } = body;

    if (!photoId) {
      return NextResponse.json(
        { error: "Photo ID is required" },
        { status: 400 }
      );
    }

    // Получить информацию о фотографии
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      select: {
        storagePath: true,
      },
    });

    if (!photo) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      );
    }

    // Удалить из Supabase Storage
    const cleanPath = photo.storagePath.replace(/^photos\//, "");
    const { error: storageError } = await supabase.storage
      .from("photos")
      .remove([cleanPath]);

    if (storageError) {
      console.error("Error deleting from storage:", storageError);
    }

    // Удалить из базы данных (каскадное удаление удалит связанные записи)
    await prisma.photo.delete({
      where: { id: photoId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
