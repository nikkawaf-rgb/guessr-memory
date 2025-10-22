import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("id");

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 }
      );
    }

    // Удаляем комментарий (лайки удалятся автоматически благодаря onDelete: Cascade)
    await prisma.comment.delete({
      where: { id: commentId },
    });

    console.log(`[ADMIN] Комментарий ${commentId} удален`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}

