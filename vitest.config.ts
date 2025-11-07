import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node", // Use node environment for API tests
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    testTimeout: 30000, // Increased timeout for database operations
    hookTimeout: 60000, // Increased timeout for hooks (beforeAll, afterAll, etc.) - needed for database setup
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", ".next"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});