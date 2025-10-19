import { z } from "zod";

// Common schemas
export const userIdSchema = z.string().min(1, "User ID is required");
export const sessionIdSchema = z.string().min(1, "Session ID is required");
export const photoIdSchema = z.string().min(1, "Photo ID is required");
export const commentIdSchema = z.string().min(1, "Comment ID is required");

// Session schemas
export const startSessionSchema = z.object({
  mode: z.enum(["ranked", "fun"]).optional().default("ranked"),
  userId: userIdSchema.optional(),
});

export const submitGuessSchema = z.object({
  sessionId: sessionIdSchema,
  sessionPhotoId: z.string().min(1, "Session photo ID is required"),
  guessedCity: z.string().optional(),
  guessedDay: z.number().int().min(1).max(31).optional(),
  guessedMonth: z.number().int().min(1).max(12).optional(),
  guessedYear: z.number().int().min(1900).max(2100).optional(),
  guessedPeopleNames: z.array(z.string()).optional().default([]),
  guessedPeopleCoords: z.array(z.object({
    x: z.number().int().min(0),
    y: z.number().int().min(0),
    personName: z.string().min(1),
  })).optional().default([]),
  hintsUsed: z.array(z.enum(["location", "date", "people"])).optional().default([]),
  timeSpentSec: z.number().int().min(0).optional(),
});

// Comment schemas
export const addCommentSchema = z.object({
  photoId: photoIdSchema,
  content: z.string().min(1, "Content is required").max(200, "Content too long"),
  authorName: z.string().max(50, "Author name too long").optional(),
});

export const likeCommentSchema = z.object({
  commentId: commentIdSchema,
});

export const reportCommentSchema = z.object({
  commentId: commentIdSchema,
  reason: z.string().max(120, "Reason too long").optional(),
});

// Photo schemas
export const registerPhotoSchema = z.object({
  key: z.string().min(1, "Storage key is required"),
  exifISO: z.string().datetime().optional(),
});

export const uploadPhotoSchema = z.object({
  file: z.instanceof(File),
});

// Leaderboard schemas
export const leaderboardQuerySchema = z.object({
  period: z.enum(["all", "daily", "weekly"]).optional().default("all"),
  mode: z.enum(["ranked", "fun"]).optional().default("ranked"),
});

// Profile schemas
export const profileQuerySchema = z.object({
  userId: userIdSchema,
});

// Achievement schemas
export const achievementQuerySchema = z.object({
  userId: userIdSchema,
});

// Admin schemas
export const createPersonSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  aliases: z.array(z.string().max(50)).optional().default([]),
});

export const createLocationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  aliases: z.array(z.string().max(50)).optional().default([]),
});

export const createZoneSchema = z.object({
  photoId: photoIdSchema,
  personId: z.string().min(1, "Person ID is required"),
  shapeType: z.enum(["rect", "circle", "polygon"]),
  shapeData: z.record(z.string(), z.unknown()),
  tolerancePx: z.number().int().min(0).max(100).optional().default(10),
});

// Utility functions
export function validateRequestBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.issues.map(e => e.message).join(", ")}`);
    }
    throw error;
  }
}

export function validateQueryParams<T>(schema: z.ZodSchema<T>, params: URLSearchParams): T {
  try {
    const obj = Object.fromEntries(params.entries());
    return schema.parse(obj);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Query validation error: ${error.issues.map(e => e.message).join(", ")}`);
    }
    throw error;
  }
}
