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
    // We need to clear the require cache to get the new client
    const prismaClientPath = path.join(process.cwd(), "node_modules", ".prisma", "client");
    delete require.cache[require.resolve(prismaClientPath)];
    
    const { PrismaClient: TestPrismaClient } = require(prismaClientPath);

    const prisma = new TestPrismaClient({
      datasources: {
        db: {
          url: databaseURL,
        },
      },
      log: process.env.DEBUG ? ["query", "error", "warn"] : ["error"],
    }) as PrismaClient;

    // Store cleanup function
    (prisma as any).__cleanup = async () => {
      await prisma.$disconnect();
      // Clean up database file
      if (fs.existsSync(dbPath)) {
        try {
          fs.unlinkSync(dbPath);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      // Clean up test schema file
      if (fs.existsSync(testSchemaPath)) {
        try {
          fs.unlinkSync(testSchemaPath);
        } catch (e) {
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
      } catch (e) {
        // Ignore
      }
    }
    if (fs.existsSync(testSchemaPath)) {
      try {
        fs.unlinkSync(testSchemaPath);
      } catch (e) {
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
  if ((prisma as any).__cleanup) {
    await (prisma as any).__cleanup();
  } else {
    await prisma.$disconnect();
  }
};