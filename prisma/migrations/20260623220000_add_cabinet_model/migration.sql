-- CreateTable
CREATE TABLE "Cabinet" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "postalCode" TEXT,
    "countryCode" TEXT NOT NULL DEFAULT 'BG',
    "phone" TEXT,
    "email" TEXT,
    "timezone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBookingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cabinet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Cabinet_organizationId_idx" ON "Cabinet"("organizationId");

-- CreateIndex
CREATE INDEX "Cabinet_organizationId_city_idx" ON "Cabinet"("organizationId", "city");

-- CreateIndex
CREATE INDEX "Cabinet_organizationId_isActive_isBookingEnabled_idx" ON "Cabinet"("organizationId", "isActive", "isBookingEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "Cabinet_organizationId_slug_key" ON "Cabinet"("organizationId", "slug");

-- AddForeignKey
ALTER TABLE "Cabinet" ADD CONSTRAINT "Cabinet_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
