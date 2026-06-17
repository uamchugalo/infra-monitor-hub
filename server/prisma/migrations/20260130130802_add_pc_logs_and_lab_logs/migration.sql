-- AlterTable
ALTER TABLE "PC" ADD COLUMN "status" TEXT;

-- CreateTable
CREATE TABLE "PCLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pcId" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    CONSTRAINT "PCLog_pcId_fkey" FOREIGN KEY ("pcId") REFERENCES "PC" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LabLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "labId" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "message" TEXT NOT NULL
);
