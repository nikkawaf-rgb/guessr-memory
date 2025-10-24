-- AlterTable
ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "uploadedBy" TEXT,
ADD COLUMN IF NOT EXISTS "uploaderComment" TEXT,
ADD COLUMN IF NOT EXISTS "moderationStatus" TEXT NOT NULL DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS "moderatedBy" TEXT,
ADD COLUMN IF NOT EXISTS "moderatedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Photo_uploadedBy_idx" ON "Photo"("uploadedBy");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Photo_moderationStatus_idx" ON "Photo"("moderationStatus");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Photo_moderatedBy_idx" ON "Photo"("moderatedBy");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_moderatedBy_fkey" FOREIGN KEY ("moderatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

