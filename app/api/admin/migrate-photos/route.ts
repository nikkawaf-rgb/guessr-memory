import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST() {
  try {
    // Применяем миграцию через Prisma напрямую
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "uploadedBy" TEXT;
    `);
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "uploaderComment" TEXT;
    `);
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "moderationStatus" TEXT NOT NULL DEFAULT 'approved';
    `);
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "moderatedBy" TEXT;
    `);
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "moderatedAt" TIMESTAMP(3);
    `);
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
    `);
    
    // Создаём индексы
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Photo_uploadedBy_idx" ON "Photo"("uploadedBy");
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Photo_moderationStatus_idx" ON "Photo"("moderationStatus");
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Photo_moderatedBy_idx" ON "Photo"("moderatedBy");
    `);
    
    // Создаём foreign keys
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'Photo_uploadedBy_fkey'
        ) THEN
          ALTER TABLE "Photo" ADD CONSTRAINT "Photo_uploadedBy_fkey" 
          FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
      END $$;
    `);
    
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'Photo_moderatedBy_fkey'
        ) THEN
          ALTER TABLE "Photo" ADD CONSTRAINT "Photo_moderatedBy_fkey" 
          FOREIGN KEY ("moderatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    return NextResponse.json({ 
      success: true, 
      message: "Migration applied successfully" 
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Migration failed" },
      { status: 500 }
    );
  }
}

