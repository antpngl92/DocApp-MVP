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
  await prisma.organization.upsert({
    where: { slug: "sofia-care-clinic" },
    update: {
      name: "Sofia Care Clinic",
      timezone: "Europe/Sofia",
      defaultCurrency: "BGN",
    },
    create: {
      name: "Sofia Care Clinic",
      slug: "sofia-care-clinic",
      timezone: "Europe/Sofia",
      defaultCurrency: "BGN",
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
