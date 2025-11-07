import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env file before Prisma reads config
config({ path: resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy",
  },
});
