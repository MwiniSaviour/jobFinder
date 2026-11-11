-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'WITHDRAWN';

-- AlterTable
ALTER TABLE "JobPost" ADD COLUMN     "category" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "jobType" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "reviews" INTEGER,
ADD COLUMN     "salaryAmount" INTEGER,
ADD COLUMN     "salaryEst" BOOLEAN,
ADD COLUMN     "salaryFrom" BOOLEAN,
ADD COLUMN     "search" tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce("title",'') || ' ' || coalesce("company",'') || ' ' || "description")) STORED;

-- CreateIndex
CREATE INDEX "JobPost_search_idx" ON "JobPost" USING GIN ("search");

-- CreateIndex
CREATE INDEX "JobPost_createdAt_id_idx" ON "JobPost"("createdAt", "id");

-- CreateIndex
CREATE INDEX "JobPost_salaryAmount_id_idx" ON "JobPost"("salaryAmount", "id");

-- CreateIndex
CREATE INDEX "JobPost_category_idx" ON "JobPost"("category");

-- CreateIndex
CREATE INDEX "JobApplication_applicantId_createdAt_id_idx" ON "JobApplication"("applicantId", "createdAt", "id");
