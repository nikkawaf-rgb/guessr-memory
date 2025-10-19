import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { withReportRateLimit } from "@/app/lib/rateLimitMiddleware";

async function reportComment(req: NextRequest) {
  try {
    const { commentId, reason } = await req.json();
    if (!commentId) return NextResponse.json({ error: "commentId required" }, { status: 400 });
    const user = await prisma.user.create({ data: { name: "Гость" } });
    await prisma.report.create({ data: { commentId, reporterUserId: user.id, reason: reason?.toString().slice(0, 120) || null } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const POST = withReportRateLimit(reportComment);


