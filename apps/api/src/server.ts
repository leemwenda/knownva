import 'dotenv/config';
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { prisma } from "./config/prisma.js";

async function main() {
  const app = createApp();

  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info("Database connection verified");
  } catch (err) {
    logger.error({ err }, "Database connection failed — aborting startup");
    process.exit(1);
  }

  const server = app.listen(env.PORT, env.BIND_HOST, () => {
    logger.info(
      { host: env.BIND_HOST, port: env.PORT, env: env.NODE_ENV },
      "KnowVa API listening",
    );
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down");
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err) => {
  logger.fatal({ err }, "Fatal startup error");
  process.exit(1);
});
