-- CreateTable
CREATE TABLE "StarterClinic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StarterClinic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StarterNote" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StarterNote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StarterNote" ADD CONSTRAINT "StarterNote_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "StarterClinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
