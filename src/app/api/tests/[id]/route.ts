import { NextRequest } from "next/server";
import { getTestService } from "@/core/services";
import { apiHandler, getRouteParams } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";

const testService = getTestService();

/**
 * GET /api/tests/[id]
 * Get a test by ID
 */
export const GET = apiHandler<unknown, { id: string }>(async (request: NextRequest, context) => {
  if (!context) {
    throw new Error("Route params are required");
  }
  const params = await getRouteParams(context);
  if (!params.id) {
    throw new Error("Test ID is required");
  }
  const test = await testService.getTestById(params.id);
  return successResponse(test);
});

/**
 * PATCH /api/tests/[id]
 * Update a test by ID
 */
export const PATCH = apiHandler<unknown, { id: string }>(async (request: NextRequest, context) => {
  if (!context) {
    throw new Error("Route params are required");
  }
  const params = await getRouteParams(context);
  if (!params.id) {
    throw new Error("Test ID is required");
  }
  const body = await request.json();
  const test = await testService.updateTest(params.id, body);
  return successResponse(test, {
    message: "Test updated successfully",
  });
});

