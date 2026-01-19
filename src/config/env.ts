export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  storageMode: process.env.TROCOZERO_STORAGE ?? "postgres",
  port: Number(process.env.PORT ?? "3000"),
  host: process.env.HOST ?? "0.0.0.0",
  apiKey: process.env.TROCOZERO_API_KEY ?? "",
  adminApiKey: process.env.TROCOZERO_ADMIN_API_KEY ?? "",
  nodeEnv: process.env.NODE_ENV ?? "development",
  logLevel: process.env.LOG_LEVEL ?? "info"
};

if (env.storageMode !== "memory" && !env.databaseUrl) {
  // Decisao importante: falhar cedo evita operar sem persistencia real.
  throw new Error("DATABASE_URL obrigatoria para modo postgres");
}
