ALTER TYPE "OrganizationMemberRole" RENAME TO "OrganizationMemberRole_old";

CREATE TYPE "OrganizationMemberRole" AS ENUM ('admin', 'receptionist', 'doctor');

ALTER TABLE "OrganizationMember"
ALTER COLUMN "role" TYPE "OrganizationMemberRole"
USING (
  CASE "role"::text
    WHEN 'owner' THEN 'admin'
    WHEN 'manager' THEN 'admin'
    ELSE "role"::text
  END
)::"OrganizationMemberRole";

DROP TYPE "OrganizationMemberRole_old";
