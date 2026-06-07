import { prisma } from "../src/lib/prisma";

const main = async () => {
  await prisma.starterClinic.findFirst();
  console.log("✅ Connected");
};

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
