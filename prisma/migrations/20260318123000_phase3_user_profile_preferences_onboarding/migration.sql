-- AlterTable
ALTER TABLE "public"."User"
ADD COLUMN "username" TEXT,
ADD COLUMN "displayName" TEXT,
ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT,
ADD COLUMN "bio" TEXT,
ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "timezone" TEXT,
ADD COLUMN "locale" TEXT,
ADD COLUMN "preferences" JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "onboardingCompletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");
