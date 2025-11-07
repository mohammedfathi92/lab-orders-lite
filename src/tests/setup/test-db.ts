import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { randomBytes } from "crypto";
import path from "path";
import fs from "fs";

/**
 * Create a SQLite test database for testing
 * Uses file-based SQLite database that gets cleaned up after tests
 */
export const createTestDatabase = async (): Promise<PrismaClient> => {
  // Generate a unique database file path for each test run
  const dbName = `test_${randomBytes(8).toString("hex")}.db`;
  const dbPath = path.join(process.cwd(), "prisma", dbName);
  const databaseURL = `file:${dbPath}`;

  // Store original DATABASE_URL
  const originalDatabaseURL = process.env.DATABASE_URL;
  process.env.DATABASE_URL = databaseURL;

  // Create a temporary schema file for SQLite
  const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
  const schemaContent = fs.readFileSync(schemaPath, "utf-8");
  
  // Replace PostgreSQL with SQLite for testing
  // Also need to adjust field types for SQLite compatibility
  let testSchemaContent = schemaContent.replace(
    /provider = "postgresql"/g,
    'provider = "sqlite"'
  );

  // SQLite doesn't support @db.Text, remove those annotations
  testSchemaContent = testSchemaContent.replace(/@db\.Text/g, "");
  
  // SQLite uses different types - Float becomes Real
  // But Prisma handles this automatically, so we can keep Float

  const testSchemaPath = path.join(process.cwd(), "prisma", "schema.test.prisma");
  fs.writeFileSync(testSchemaPath, testSchemaContent);

  try {
    // Generate Prisma Client with test schema
    execSync(`npx prisma generate --schema=${testSchemaPath}`, { 
      stdio: "pipe",
      env: {
        ...process.env,
        DATABASE_URL: databaseURL,
      },
    });

    // Push schema to test database
    execSync(`npx prisma db push --schema=${testSchemaPath} --skip-generate --accept-data-loss`, {
      stdio: "pipe",
      env: {
        ...process.env,
        DATABASE_URL: databaseURL,
      },
    });

    // Import the generated Prisma client
    // Clear the module cache to ensure we get a fresh client instance
    // Using require.resolve to get the module path, then clearing cache
    // Note: require.resolve() is allowed - it doesn't import, just resolves the path
    const prismaClientPath = require.resolve("@prisma/client");
    // Clear require cache for Prisma client
    if (require.cache[prismaClientPath]) {
      delete require.cache[prismaClientPath];
    }
    // Dynamic import after clearing cache
    const prismaClientModule = await import("@prisma/client");
    const TestPrismaClient = prismaClientModule.PrismaClient;

    const prisma = new TestPrismaClient({
      datasources: {
        db: {
          url: databaseURL,
        },
      },
      log: process.env.DEBUG ? ["query", "error", "warn"] : ["error"],
    }) as PrismaClient;

    // Store cleanup function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma as any).__cleanup = async () => {
      await prisma.$disconnect();
      // Clean up database file
      if (fs.existsSync(dbPath)) {
        try {
          fs.unlinkSync(dbPath);
        } catch {
          // Ignore cleanup errors
        }
      }
      // Clean up test schema file
      if (fs.existsSync(testSchemaPath)) {
        try {
          fs.unlinkSync(testSchemaPath);
        } catch {
          // Ignore cleanup errors
        }
      }
      // Restore original DATABASE_URL
      if (originalDatabaseURL) {
        process.env.DATABASE_URL = originalDatabaseURL;
      }
    };

    return prisma;
  } catch (error) {
    // Cleanup on error
    if (fs.existsSync(dbPath)) {
      try {
        fs.unlinkSync(dbPath);
      } catch {
        // Ignore
      }
    }
    if (fs.existsSync(testSchemaPath)) {
      try {
        fs.unlinkSync(testSchemaPath);
      } catch {
        // Ignore
      }
    }
    if (originalDatabaseURL) {
      process.env.DATABASE_URL = originalDatabaseURL;
    }
    throw error;
  }
};

export const cleanupTestDatabase = async (prisma: PrismaClient): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((prisma as any).__cleanup) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).__cleanup();
  } else {
    await prisma.$disconnect();
  }
};