import { NextRequest } from "next/server";
import { z } from "zod";
import { getTestService } from "@/core/services";
import { apiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";

const testService = getTestService();

/**
 * GET /api/tests
 * List all tests with optional filters
 * Query params: ?name=Test&isAvailable=true&minPrice=10&maxPrice=100&search=Blood
 */
export const GET = apiHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const filters: Record<string, string | boolean | number> = {};

  if (searchParams.has("name")) {
    filters.name = searchParams.get("name")!;
  }
  if (searchParams.has("isAvailable")) {
    filters.isAvailable = searchParams.get("isAvailable") === "true";
  }
  if (searchParams.has("minPrice")) {
    filters.minPrice = parseFloat(searchParams.get("minPrice")!);
  }
  if (searchParams.has("maxPrice")) {
    filters.maxPrice = parseFloat(searchParams.get("maxPrice")!);
  }
  if (searchParams.has("search")) {
    filters.search = searchParams.get("search")!;
  }

  const tests = await testService.getAllTests(
    Object.keys(filters).length > 0 ? filters : undefined
  );

  return successResponse(tests);
});

/**
 * POST /api/tests
 * Create a new test
 */
export const POST = apiHandler(async (request: NextRequest) => {
  const body = await request.json();

  const test = await testService.createTest(body);

  return successResponse(test, {
    status: 201,
    message: "Test created successfully",
  });
});
