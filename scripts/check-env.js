#!/usr/bin/env node
/**
 * Check that DATABASE_URL is set correctly for development
 * This ensures we're using PostgreSQL, not SQLite from tests
 */

const fs = require("fs");
const path = require("path");

/**
 * Load .env file manually (since we run before Next.js loads it)
 */
function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  const envLocalPath = path.join(process.cwd(), ".env.local");
  
  // Check if .env.local exists (takes precedence)
  const envFile = fs.existsSync(envLocalPath) ? envLocalPath : envPath;
  
  if (!fs.existsSync(envFile)) {
    return false;
  }
  
  try {
    const envContent = fs.readFileSync(envFile, "utf-8");
    const lines = envContent.split("\n");
    
    for (const line of lines) {
      // Skip comments and empty lines
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }
      
      // Parse KEY=VALUE or KEY="VALUE"
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        // Only set if not already in process.env (environment takes precedence)
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.warn(`Warning: Could not read ${envFile}: ${error.message}`);
    return false;
  }
}

// Load .env file if it exists
const envLoaded = loadEnvFile();

const requiredEnvVars = {
  DATABASE_URL: {
    required: true,
    validate: (value) => {
      if (!value) {
        return "DATABASE_URL is not set";
      }
      // Check if it's a PostgreSQL URL
      if (value.startsWith("postgresql://") || value.startsWith("postgres://")) {
        return null; // Valid
      }
      // Check if it's a SQLite URL (should not be used in dev)
      if (value.startsWith("file:")) {
        return "DATABASE_URL points to SQLite. For development, use PostgreSQL. Check your .env file.";
      }
      return "DATABASE_URL format is invalid. Expected postgresql:// or postgres://";
    },
  },
  NEXTAUTH_SECRET: {
    required: true,
    validate: (value) => {
      if (!value) {
        return "NEXTAUTH_SECRET is not set";
      }
      if (value.length < 32) {
        return "NEXTAUTH_SECRET should be at least 32 characters";
      }
      return null;
    },
  },
  NEXTAUTH_URL: {
    required: false,
    validate: (value) => {
      if (!value) {
        return "NEXTAUTH_URL is not set (optional, but recommended)";
      }
      return null;
    },
  },
};

function checkEnv() {
  console.log("Checking environment variables...\n");
  
  if (!envLoaded) {
    console.log("ℹ️  No .env file found. Will check environment variables only.\n");
  }
  
  let hasErrors = false;
  
  for (const [varName, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[varName];
    
    if (config.required && !value) {
      console.error(`❌ ${varName}: ${config.validate(value) || "is required"}`);
      hasErrors = true;
      continue;
    }
    
    if (value) {
      const error = config.validate(value);
      if (error) {
        if (config.required) {
          console.error(`❌ ${varName}: ${error}`);
          hasErrors = true;
        } else {
          console.warn(`⚠️  ${varName}: ${error}`);
        }
      } else {
        // Mask sensitive values
        const displayValue = varName.includes("SECRET") || varName.includes("PASSWORD")
          ? "***"
          : varName === "DATABASE_URL"
          ? value.replace(/:[^:@]+@/, ":****@") // Mask password
          : value;
        console.log(`✅ ${varName}: ${displayValue}`);
      }
    }
  }
  
  if (hasErrors) {
    console.error("\n❌ Environment check failed. Please fix the errors above.");
    console.error("\nCreate a .env file in the root directory with the following:");
    console.error("");
    console.error('DATABASE_URL="postgresql://user:password@localhost:5432/lab_orders"');
    console.error('NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"');
    console.error('NEXTAUTH_URL="http://localhost:3000"');
    console.error("");
    console.error("Or set these as environment variables in your system.");
    process.exit(1);
  }
  
  console.log("\n✅ Environment variables are valid!");
}

checkEnv();

