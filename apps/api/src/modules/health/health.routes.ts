import { Router } from "express";
import { prisma } from "../../config/prisma.js";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }
  res.status(dbOk ? 200 : 503).json({
    ok: dbOk,
    status: dbOk ? "healthy" : "degraded",
    db: dbOk ? "up" : "down",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});
