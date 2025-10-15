"use server";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function likeComment(commentId: string, photoId: string) {
  const user = await prisma.user.create({ data: { name: "Гость" } });
  await prisma.commentLike.create({ data: { commentId, userId: user.id } });
  revalidatePath(`/photo/${photoId}`);
}

export async function reportComment(commentId: string, photoId: string) {
  const user = await prisma.user.create({ data: { name: "Гость" } });
  await prisma.report.create({ data: { commentId, reporterUserId: user.id } });
  revalidatePath(`/photo/${photoId}`);
}


