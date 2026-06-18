-- CreateEnum
CREATE TYPE "DoctorOnboardingStatus" AS ENUM ('pending_admin_approval', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "organizationMemberId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "specialty" TEXT,
    "onboardingStatus" "DoctorOnboardingStatus" NOT NULL DEFAULT 'pending_admin_approval',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isBookable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_userId_key" ON "Doctor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_organizationMemberId_key" ON "Doctor"("organizationMemberId");

-- CreateIndex
CREATE INDEX "Doctor_organizationId_idx" ON "Doctor"("organizationId");

-- CreateIndex
CREATE INDEX "Doctor_organizationId_onboardingStatus_idx" ON "Doctor"("organizationId", "onboardingStatus");

-- CreateIndex
CREATE INDEX "Doctor_organizationId_isActive_idx" ON "Doctor"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "Doctor_organizationId_isBookable_idx" ON "Doctor"("organizationId", "isBookable");

-- CreateIndex
CREATE INDEX "Doctor_email_idx" ON "Doctor"("email");

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_organizationMemberId_fkey" FOREIGN KEY ("organizationMemberId") REFERENCES "OrganizationMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
