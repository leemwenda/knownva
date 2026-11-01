import pinoFn, { type Logger, type LoggerOptions } from "pino";
const pino = pinoFn as unknown as (opts?: LoggerOptions) => Logger;
import { env, isProd } from "../config/env.js";

export const logger = pino({
  level: env.LOG_LEVEL,
  ...(isProd
    ? {}
    : { transport: { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:HH:MM:ss" } } }),
  redact: {
    paths: [
      "req.headers.cookie",
      "req.headers.authorization",
      "res.headers['set-cookie']",
      "*.password",
      "*.passwordHash",
      "*.token",
      "*.verificationToken",
      "*.resetToken",
    ],
    censor: "[redacted]",
  },
});
