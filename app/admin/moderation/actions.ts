"use server";
import { prisma } from "@/app/lib/prisma";
import { requireAdmin } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";

export async function moderateComment(formData: FormData) {
  await requireAdmin();

  const commentId = formData.get("commentId") as string;
  const action = formData.get("action") as "hide" | "approve";

  if (!commentId || !action) {
    throw new Error("Missing required fields");
  }

  // Update comment visibility
  await prisma.comment.update({
    where: { id: commentId },
    data: {
      isHidden: action === "hide",
    },
  });

  // Mark all reports for this comment as resolved
  await prisma.report.updateMany({
    where: { commentId },
    data: {
      resolved: true,
      resolvedAt: new Date(),
      resolution: action === "hide" ? "hidden" : "approved",
    },
  });

  revalidatePath("/admin/moderation");
}

export async function bulkModerateComments(commentIds: string[], action: "hide" | "approve") {
  await requireAdmin();

  // Update comments visibility
  await prisma.comment.updateMany({
    where: { id: { in: commentIds } },
    data: {
      isHidden: action === "hide",
    },
  });

  // Mark all reports for these comments as resolved
  await prisma.report.updateMany({
    where: { commentId: { in: commentIds } },
    data: {
      resolved: true,
      resolvedAt: new Date(),
      resolution: action === "hide" ? "hidden" : "approved",
    },
  });

  revalidatePath("/admin/moderation");
}

export async function getModerationStats() {
  await requireAdmin();

  const stats = await prisma.report.groupBy({
    by: ["resolved"],
    _count: {
      id: true,
    },
  });

  const totalReports = await prisma.report.count();
  const resolvedReports = stats.find(s => s.resolved)?._count.id || 0;
  const pendingReports = totalReports - resolvedReports;

  const recentReports = await prisma.report.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
  });

  return {
    totalReports,
    resolvedReports,
    pendingReports,
    recentReports,
  };
}
