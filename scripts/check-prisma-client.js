#!/usr/bin/env node
/**
 * Check if Prisma client is configured for PostgreSQL
 * If it's configured for SQLite (from tests), regenerate it for PostgreSQL
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Simple sleep function for retries
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkPrismaClient() {
  // Check if we're in development mode (not test mode)
  if (process.env.NODE_ENV === "test" || process.env.VITEST) {
    return; // Skip in test mode
  }

  const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
  const testSchemaPath = path.join(process.cwd(), "prisma", "schema.test.prisma");
  
  // Always check if we need PostgreSQL client in dev mode
  // This ensures we have the correct client even if tests ran previously
  try {
    // Read the main schema to check provider
    if (!fs.existsSync(schemaPath)) {
      return; // No schema file, skip
    }
    
    const schemaContent = fs.readFileSync(schemaPath, "utf-8");
    const isPostgreSQL = schemaContent.includes('provider = "postgresql"');
    
    // Only regenerate if test schema exists (tests ran and generated SQLite client)
    // The test schema file is left by test teardown as a marker
    if (isPostgreSQL && fs.existsSync(testSchemaPath)) {
      console.log("🔄 Test schema detected. Regenerating Prisma client for PostgreSQL...");
      console.log("🔄 (Tests generated SQLite client, switching back to PostgreSQL)");
      
      // Try to regenerate with PostgreSQL schema
      // Use retries for Windows file locks
      let retries = 5;
      let success = false;
      
      while (retries > 0 && !success) {
        try {
          execSync(`npx prisma generate --schema=${schemaPath}`, {
            stdio: "pipe",
            env: {
              ...process.env,
            },
          });
          console.log("✅ PostgreSQL Prisma client regenerated successfully");
          success = true;
          
          // Clean up test schema file after successful regeneration
          try {
            fs.unlinkSync(testSchemaPath);
            console.log("✅ Cleaned up test schema file");
          } catch {
            // Ignore cleanup errors
          }
        } catch (error) {
          const errorMsg = (error.message || "").toString();
          if (errorMsg.includes("EPERM") || errorMsg.includes("operation not permitted")) {
            retries--;
            if (retries > 0) {
              console.log(`⚠️  File lock detected, retrying in 2 seconds... (${retries} attempts left)`);
              await sleep(2000);
            } else {
              // File lock after retries - dev server is likely running
              console.warn("");
              console.error("");
              console.error("❌ ERROR: Could not regenerate Prisma client due to file lock.");
              console.error("");
              console.error("The Prisma client is configured for SQLite (from tests), but");
              console.error("development needs PostgreSQL. The file is locked (dev server running?).");
              console.error("");
              console.error("═══════════════════════════════════════════════════════════════");
              console.error("TO FIX THIS:");
              console.error("═══════════════════════════════════════════════════════════════");
              console.error("  1. Stop the dev server completely (Ctrl+C in its terminal)");
              console.error("  2. Run: npm run db:generate");
              console.error("  3. Start dev server again: npm run dev");
              console.error("");
              console.error("RECOMMENDED WORKFLOW:");
              console.error("  • Stop dev server before running tests");
              console.error("  • Run tests: npm test");
              console.error("  • Start dev server: npm run dev (auto-regenerates client)");
              console.error("═══════════════════════════════════════════════════════════════");
              console.error("");
              // Don't exit - let dev server start and show the database error
              // This way user sees both the warning and the actual error
              // They can then stop dev server and fix it
            }
          } else {
            // Non-lock error - log but don't exit (let dev server show error)
            console.error("❌ Error regenerating Prisma client:", errorMsg);
            console.warn("⚠️  Please run: npm run db:generate manually");
            // Don't exit - let dev server start and show the actual error
          }
        }
      }
    }
  } catch (error) {
    // If we can't read the schema or regenerate, just warn
    console.warn("⚠️  Could not check/regenerate Prisma client:", error.message);
    console.warn("⚠️  If you see database errors, run: npm run db:generate");
  }
}

// Only run if this script is executed directly (not imported)
if (require.main === module) {
  checkPrismaClient().catch(error => {
    console.error("Error in checkPrismaClient:", error);
    process.exit(1);
  });
}

module.exports = { checkPrismaClient };

