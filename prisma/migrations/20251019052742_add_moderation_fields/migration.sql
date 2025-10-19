-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "resolution" TEXT,
ADD COLUMN     "resolved" BOOLEAN NOT NULL DEFAULT false;
