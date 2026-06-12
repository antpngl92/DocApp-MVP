-- CreateEnum
CREATE TYPE "ClerkInvitationStatus" AS ENUM ('pending', 'accepted', 'revoked', 'expired');

-- AlterTable
ALTER TABLE "OrganizationMember" ADD COLUMN     "clerkInvitationId" TEXT,
ADD COLUMN     "clerkInvitationStatus" "ClerkInvitationStatus";

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_clerkInvitationId_key" ON "OrganizationMember"("clerkInvitationId");

-- Prevent duplicate pending/active staff access for the same email in one clinic.
CREATE UNIQUE INDEX "OrganizationMember_active_invited_email_key"
ON "OrganizationMember"("organizationId", "invitedEmail")
WHERE "invitedEmail" IS NOT NULL
  AND "status" IN ('invited', 'active');
