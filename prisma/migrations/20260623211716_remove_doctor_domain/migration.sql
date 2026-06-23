-- Retain former doctor memberships without granting them administrative access.
UPDATE "OrganizationMember"
SET "role" = 'receptionist', "status" = 'disabled'
WHERE "role" = 'doctor';

-- Remove the superseded staff role from the PostgreSQL enum.
BEGIN;
CREATE TYPE "OrganizationMemberRole_new" AS ENUM ('admin', 'receptionist');
ALTER TABLE "OrganizationMember"
ALTER COLUMN "role" TYPE "OrganizationMemberRole_new"
USING ("role"::text::"OrganizationMemberRole_new");
ALTER TYPE "OrganizationMemberRole" RENAME TO "OrganizationMemberRole_old";
ALTER TYPE "OrganizationMemberRole_new" RENAME TO "OrganizationMemberRole";
DROP TYPE "OrganizationMemberRole_old";
COMMIT;

-- Remove the obsolete doctor profile and onboarding state.
DROP TABLE "Doctor";
DROP TYPE "DoctorOnboardingStatus";
