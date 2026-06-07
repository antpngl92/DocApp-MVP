import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

const main = async () => {
  const clinic = await prisma.starterClinic.upsert({
    where: { id: "starter-clinic-sofia-care" },
    update: {
      name: "Sofia Care Clinic",
    },
    create: {
      id: "starter-clinic-sofia-care",
      name: "Sofia Care Clinic",
    },
  });

  await prisma.starterNote.upsert({
    where: { id: "starter-note-booking-foundation" },
    update: {
      content: "Prisma Postgres connection verified for the MVP foundation.",
    },
    create: {
      id: "starter-note-booking-foundation",
      clinicId: clinic.id,
      content: "Prisma Postgres connection verified for the MVP foundation.",
    },
  });
};

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
