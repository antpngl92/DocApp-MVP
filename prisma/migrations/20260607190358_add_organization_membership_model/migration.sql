-- CreateEnum
CREATE TYPE "OrganizationMemberRole" AS ENUM ('owner', 'admin', 'manager', 'receptionist', 'doctor');

-- CreateEnum
CREATE TYPE "OrganizationMemberStatus" AS ENUM ('invited', 'active', 'disabled', 'removed');

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "role" "OrganizationMemberRole" NOT NULL,
    "status" "OrganizationMemberStatus" NOT NULL DEFAULT 'invited',
    "invitedEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_idx" ON "OrganizationMember"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_invitedEmail_idx" ON "OrganizationMember"("organizationId", "invitedEmail");

-- CreateIndex
CREATE INDEX "OrganizationMember_role_idx" ON "OrganizationMember"("role");

-- CreateIndex
CREATE INDEX "OrganizationMember_status_idx" ON "OrganizationMember"("status");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_userId_key" ON "OrganizationMember"("userId");

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
