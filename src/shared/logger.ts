import pino from "pino";
import { env } from "../config/env.js";

export const logger = pino({
  level: env.logLevel,
  transport:
    env.nodeEnv === "development"
      ? {
          target: "pino-pretty",
          options: { colorize: true }
        }
      : undefined,
  base: {
    service: "trocozero",
    version: "0.1.0"
  },
  timestamp: pino.stdTimeFunctions.isoTime
});

export function createChildLogger(context: Record<string, unknown>) {
  return logger.child(context);
}
