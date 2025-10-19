import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { withCommentRateLimit } from "@/app/lib/rateLimitMiddleware";
import { addCommentSchema, validateRequestBody } from "@/app/lib/validation";

async function addComment(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { photoId, content, authorName } = validateRequestBody(addCommentSchema, body);

    // Create lightweight user without email (guest) if necessary
    const user = await prisma.user.create({ 
      data: { 
        name: authorName || "Гость"
      } 
    });
    
    const comment = await prisma.comment.create({
      data: {
        photoId,
        userId: user.id,
        content,
      },
    });
    
    return NextResponse.json({ id: comment.id });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const POST = withCommentRateLimit(addComment);


