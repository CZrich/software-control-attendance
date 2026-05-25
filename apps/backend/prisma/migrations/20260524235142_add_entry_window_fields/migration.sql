-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "entryWindowAfterMinutes" INTEGER NOT NULL DEFAULT 120,
ADD COLUMN     "entryWindowBeforeMinutes" INTEGER NOT NULL DEFAULT 60;
