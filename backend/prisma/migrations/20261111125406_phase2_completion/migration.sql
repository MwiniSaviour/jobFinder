-- CreateEnum
CREATE TYPE "JobPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');

-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN     "answers" JSONB;

-- AlterTable
ALTER TABLE "JobPost" ADD COLUMN     "locationText" TEXT,
ADD COLUMN     "status" "JobPostStatus" NOT NULL DEFAULT 'PUBLISHED';

-- CreateTable
CREATE TABLE "SavedJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecentSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "queryKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecentSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "key" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key","windowStart")
);

-- CreateIndex
CREATE INDEX "SavedJob_userId_createdAt_id_idx" ON "SavedJob"("userId", "createdAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "SavedJob_userId_postId_key" ON "SavedJob"("userId", "postId");

-- CreateIndex
CREATE INDEX "RecentSearch_userId_createdAt_id_idx" ON "RecentSearch"("userId", "createdAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "RecentSearch_userId_queryKey_key" ON "RecentSearch"("userId", "queryKey");

-- CreateIndex
CREATE INDEX "RateLimitBucket_windowStart_idx" ON "RateLimitBucket"("windowStart");

-- CreateIndex
CREATE INDEX "JobPost_status_createdAt_id_idx" ON "JobPost"("status", "createdAt", "id");

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_postId_fkey" FOREIGN KEY ("postId") REFERENCES "JobPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentSearch" ADD CONSTRAINT "RecentSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex (hand-maintained: Prisma cannot express a GiST index over an Unsupported column)
CREATE INDEX "JobPost_location_gist_idx" ON "JobPost" USING GIST ("location");
