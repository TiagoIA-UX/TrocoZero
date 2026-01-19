import "dotenv/config";
import Fastify from "fastify";
import { z } from "zod";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fastifyStatic from "@fastify/static";
import { ProcessCashSale } from "../application/use-cases/ProcessCashSale.js";
import { RequestPixChange } from "../application/use-cases/RequestPixChange.js";
import { ConfirmPixTransfer } from "../application/use-cases/ConfirmPixTransfer.js";
import { GetDailyReport } from "../application/use-cases/GetDailyReport.js";
import { InMemorySaleRepository } from "../infrastructure/repositories/InMemorySaleRepository.js";
import { InMemoryPixTransferRepository } from "../infrastructure/repositories/InMemoryPixTransferRepository.js";
import { InMemoryTransactionLogRepository } from "../infrastructure/repositories/InMemoryTransactionLogRepository.js";
import { PgSaleRepository } from "../infrastructure/repositories/PgSaleRepository.js";
import { PgPixTransferRepository } from "../infrastructure/repositories/PgPixTransferRepository.js";
import { PgTransactionLogRepository } from "../infrastructure/repositories/PgTransactionLogRepository.js";
import { InMemoryStoreRepository } from "../infrastructure/repositories/InMemoryStoreRepository.js";
import { InMemoryCashRegisterRepository } from "../infrastructure/repositories/InMemoryCashRegisterRepository.js";
import { PgStoreRepository } from "../infrastructure/repositories/PgStoreRepository.js";
import { PgCashRegisterRepository } from "../infrastructure/repositories/PgCashRegisterRepository.js";
import { env } from "../config/env.js";
import { CreateStore } from "../application/use-cases/CreateStore.js";
import { ListStores } from "../application/use-cases/ListStores.js";
import { CreateCashRegister } from "../application/use-cases/CreateCashRegister.js";
import { ListCashRegisters } from "../application/use-cases/ListCashRegisters.js";

const app = Fastify({ logger: true });

const saleRepo =
  env.storageMode === "memory" ? new InMemorySaleRepository() : new PgSaleRepository();
const pixRepo =
  env.storageMode === "memory" ? new InMemoryPixTransferRepository() : new PgPixTransferRepository();
const logRepo =
  env.storageMode === "memory"
    ? new InMemoryTransactionLogRepository()
    : new PgTransactionLogRepository();
const storeRepo =
  env.storageMode === "memory" ? new InMemoryStoreRepository() : new PgStoreRepository();
const registerRepo =
  env.storageMode === "memory"
    ? new InMemoryCashRegisterRepository()
    : new PgCashRegisterRepository();

const processCashSale = new ProcessCashSale(saleRepo, logRepo);
const requestPixChange = new RequestPixChange(saleRepo, pixRepo, logRepo);
const confirmPixTransfer = new ConfirmPixTransfer(pixRepo, saleRepo, logRepo);
const getDailyReport = new GetDailyReport(logRepo);
const createStore = new CreateStore(storeRepo);
const listStores = new ListStores(storeRepo);
const createCashRegister = new CreateCashRegister(registerRepo);
const listCashRegisters = new ListCashRegisters(registerRepo);

// Idempotencia basica em memoria para o MVP.
const idempotency = new Map<string, unknown>();

app.setErrorHandler((error, _req, reply) => {
  if (error instanceof z.ZodError) {
    return reply.status(400).send({
      error: "VALIDATION_ERROR",
      details: error.errors
    });
  }
  return reply.status(500).send({ error: "INTERNAL_ERROR" });
});

const cashSaleSchema = z.object({
  storeId: z.string().min(1),
  registerId: z.string().min(1),
  saleTotal: z.number().int().positive(),
  cashReceived: z.number().int().positive()
});

const pixChangeSchema = z.object({
  pixKey: z.string().min(1)
});

const dailyReportSchema = z.object({
  storeId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

const storeSchema = z.object({
  name: z.string().min(2)
});

const cashRegisterSchema = z.object({
  label: z.string().min(1)
});

app.addHook("onRequest", async (req, reply) => {
  if (!env.apiKey) return;
  if (req.url.startsWith("/health")) return;
  if (req.url === "/" || req.url.startsWith("/static/")) return;
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== env.apiKey) {
    return reply.status(401).send({ error: "UNAUTHORIZED" });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.register(fastifyStatic, {
  root: path.join(__dirname, "../../public"),
  prefix: "/static/"
});

app.get("/health", async (_req, res) => {
  return res.send({ ok: true });
});

app.get("/", async (_req, reply) => {
  return reply.sendFile("index.html");
});

app.post("/stores", async (req, res) => {
  const body = storeSchema.parse(req.body);
  const result = await createStore.execute(body);
  return res.send(result);
});

app.get("/stores", async (_req, res) => {
  const result = await listStores.execute();
  return res.send(result);
});

app.post("/stores/:storeId/registers", async (req, res) => {
  const params = req.params as { storeId: string };
  const body = cashRegisterSchema.parse(req.body);

  const store = await storeRepo.findById(params.storeId);
  if (!store) return res.status(404).send({ error: "STORE_NOT_FOUND" });

  const result = await createCashRegister.execute({
    storeId: params.storeId,
    label: body.label
  });
  return res.send(result);
});

app.get("/stores/:storeId/registers", async (req, res) => {
  const params = req.params as { storeId: string };
  const result = await listCashRegisters.execute({ storeId: params.storeId });
  return res.send(result);
});

app.post("/sales/cash", async (req, res) => {
  const key = req.headers["idempotency-key"] as string | undefined;
  if (key && idempotency.has(key)) return res.send(idempotency.get(key));

  const body = cashSaleSchema.parse(req.body);

  const store = await storeRepo.findById(body.storeId);
  if (!store) return res.status(404).send({ error: "STORE_NOT_FOUND" });

  const register = await registerRepo.findById(body.registerId);
  if (!register || register.storeId !== body.storeId) {
    return res.status(404).send({ error: "REGISTER_NOT_FOUND" });
  }

  const result = await processCashSale.execute(body);
  if (key) idempotency.set(key, result);
  return res.send(result);
});

app.post("/sales/:saleId/pix-change", async (req, res) => {
  const params = req.params as { saleId: string };
  const body = pixChangeSchema.parse(req.body);

  const result = await requestPixChange.execute({
    saleId: params.saleId,
    pixKey: body.pixKey
  });

  return res.send(result);
});

app.post("/pix-transfers/:pixTransferId/confirm", async (req, res) => {
  const params = req.params as { pixTransferId: string };
  const result = await confirmPixTransfer.execute({ pixTransferId: params.pixTransferId });
  return res.send(result);
});

app.get("/reports/daily", async (req, res) => {
  const query = dailyReportSchema.parse(req.query);
  const result = await getDailyReport.execute(query);
  return res.send(result);
});

app.listen({ port: env.port, host: env.host }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
