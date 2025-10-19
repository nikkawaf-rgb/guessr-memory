import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIdentifier } from "@/app/lib/rateLimit";

// Rate limit configurations
const RATE_LIMITS = {
  comments: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 comments per minute
  likes: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 likes per minute
  reports: { windowMs: 60 * 1000, maxRequests: 3 }, // 3 reports per minute
} as const;

export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: { windowMs: number; maxRequests: number }
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const identifier = getClientIdentifier(req);
    const rateLimitResult = checkRateLimit(identifier, config);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded",
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": config.maxRequests.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
            "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    const response = await handler(req);
    
    // Add rate limit headers to successful responses
    response.headers.set("X-RateLimit-Limit", config.maxRequests.toString());
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
    response.headers.set("X-RateLimit-Reset", rateLimitResult.resetTime.toString());

    return response;
  };
}

// Pre-configured rate limiters
export const withCommentRateLimit = (handler: (req: NextRequest) => Promise<NextResponse>) =>
  withRateLimit(handler, RATE_LIMITS.comments);

export const withLikeRateLimit = (handler: (req: NextRequest) => Promise<NextResponse>) =>
  withRateLimit(handler, RATE_LIMITS.likes);

export const withReportRateLimit = (handler: (req: NextRequest) => Promise<NextResponse>) =>
  withRateLimit(handler, RATE_LIMITS.reports);
