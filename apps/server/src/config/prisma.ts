import { fileURLToPath } from "url";
import { PrismaClient } from "../generated/prisma/client";
import path from "path";
import dotenv from "dotenv";

// Load .env BEFORE creating PrismaClient
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

//instane of prisma client to reuse
const prisma = new PrismaClient();

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
