CREATE TYPE "ResourceReviewStatus" AS ENUM ('pending', 'approved', 'rejected', 'flagged');

ALTER TABLE "resources"
ADD COLUMN "review_status" "ResourceReviewStatus" NOT NULL DEFAULT 'approved',
ADD COLUMN "review_reason" TEXT,
ADD COLUMN "reviewed_at" TIMESTAMP(3);

CREATE INDEX "resources_review_status_created_at_idx" ON "resources"("review_status", "created_at");
