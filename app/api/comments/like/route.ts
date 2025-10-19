import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { withLikeRateLimit } from "@/app/lib/rateLimitMiddleware";
import { likeCommentSchema, validateRequestBody } from "@/app/lib/validation";

async function likeComment(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { commentId } = validateRequestBody(likeCommentSchema, body);
    // anonymous like: create temp user for counting
    const user = await prisma.user.create({ data: { name: "Гость" } });
    await prisma.commentLike.create({ data: { commentId, userId: user.id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const POST = withLikeRateLimit(likeComment);


