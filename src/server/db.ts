import { PrismaClient } from "@prisma/client";
import { env } from "@/env";

const createPrismaClient = () =>
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

// Handle connection errors gracefully
db.$connect().catch((err) => {
  console.error("Failed to connect to database:", err);
});

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await db.$disconnect();
});