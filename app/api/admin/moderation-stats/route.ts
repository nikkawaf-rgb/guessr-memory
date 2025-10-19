import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAdmin } from "@/app/lib/auth";

export async function GET() {
  try {
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

    const hiddenComments = await prisma.comment.count({
      where: { isHidden: true },
    });

    const totalComments = await prisma.comment.count();

    return NextResponse.json({
      totalReports,
      resolvedReports,
      pendingReports,
      recentReports,
      hiddenComments,
      totalComments,
    });
  } catch (error) {
    console.error("Error getting moderation stats:", error);
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 });
  }
}
