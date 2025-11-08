import { execSync } from "child_process";
import path from "path";
import fs from "fs";

// Store original DATABASE_URL to restore later
let originalDatabaseURL: string | undefined;

/**
 * Global setup for tests - generates Prisma client with SQLite schema once
 * This runs before all tests to avoid file lock issues on Windows
 */
export async function setup() {
  console.log("Setting up test environment...");

  // Backup original DATABASE_URL
  originalDatabaseURL = process.env.DATABASE_URL;

  // Create test schema file
  const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
  const schemaContent = fs.readFileSync(schemaPath, "utf-8");

  // Replace PostgreSQL with SQLite for testing
  let testSchemaContent = schemaContent.replace(
    /provider = "postgresql"/g,
    'provider = "sqlite"'
  );

  // SQLite doesn't support @db.Text, remove those annotations
  testSchemaContent = testSchemaContent.replace(/@db\.Text/g, "");

  const testSchemaPath = path.join(process.cwd(), "prisma", "schema.test.prisma");
  
  // Write test schema file
  fs.writeFileSync(testSchemaPath, testSchemaContent);

  // Use a temporary database URL for schema validation
  const tempDbPath = path.join(process.cwd(), "prisma", "temp_setup.db");
  const tempDatabaseURL = `file:${tempDbPath}`;

  try {
    // Push schema to temporary database to validate it
    execSync(`npx prisma db push --schema=${testSchemaPath} --accept-data-loss`, {
      stdio: "pipe",
      env: {
        ...process.env,
        DATABASE_URL: tempDatabaseURL,
      },
    });

    // Generate Prisma Client with test schema
    // Only generate if client doesn't exist or is outdated
    const prismaClientPath = path.join(process.cwd(), "node_modules", "@prisma", "client", "index.js");
    
    try {
      execSync(`npx prisma generate --schema=${testSchemaPath}`, {
        stdio: "pipe",
        env: {
          ...process.env,
          DATABASE_URL: tempDatabaseURL,
        },
      });
      console.log("✅ Test Prisma client generated successfully");
    } catch (error) {
      const errorMsg = (error as Error).message || "";
      // If it's a file lock error and client exists, it's okay (might be from concurrent setup)
      if (errorMsg.includes("EPERM") || errorMsg.includes("operation not permitted")) {
        if (fs.existsSync(prismaClientPath)) {
          console.log("⚠️  File lock detected, but client exists. Continuing...");
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
  } finally {
    // Clean up temp database
    if (fs.existsSync(tempDbPath)) {
      try {
        fs.unlinkSync(tempDbPath);
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  console.log("✅ Test environment setup complete");
}

export async function teardown() {
  console.log("Tearing down test environment...");
  
  // DON'T clean up test schema file here - leave it as a marker
  // The dev server's check-prisma-client.js will detect it and regenerate PostgreSQL client
  // It will also clean up the test schema file after regenerating
  const testSchemaPath = path.join(process.cwd(), "prisma", "schema.test.prisma");
  // Leave the file so dev startup can detect tests ran and regenerate client

  // Restore original DATABASE_URL
  if (originalDatabaseURL) {
    process.env.DATABASE_URL = originalDatabaseURL;
  }

  // Note: We don't regenerate the PostgreSQL client here to avoid file lock issues
  // The dev server will automatically check and regenerate it on startup via check-prisma-client.js
  console.log("ℹ️  Note: Prisma client was generated with SQLite schema for tests.");
  console.log("ℹ️  The dev server will automatically regenerate it for PostgreSQL on startup.");
  console.log("ℹ️  If needed, run: npm run db:generate");

  console.log("✅ Test environment teardown complete");
}

