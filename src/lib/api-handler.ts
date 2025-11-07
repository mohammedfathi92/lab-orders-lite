import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse, validationErrorResponse } from "./api-response";
import { logger } from "./logger";
import { AppError, ValidationError } from "./errors";

/**
 * Wrapper for API route handlers with error handling
 * Supports both regular routes and dynamic routes with params
 */
export function apiHandler<T, TParams extends { [key: string]: string } = { [key: string]: string }>(
  handler: (
    request: NextRequest,
    context?: { params?: Promise<TParams> | TParams }
  ) => Promise<NextResponse<T>>
) {
  // Use rest parameters to capture all arguments
  return async (
    request: NextRequest,
    ...args: any[]
  ): Promise<NextResponse> => {
    try {
      // Forward all arguments to the handler
      // If second argument exists, pass it as context, otherwise pass undefined
      const context = args[0] || undefined;
      return await handler(request, context);
    } catch (error) {
      logger.error("API Error", error);

      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        return validationErrorResponse(error.issues);
      }

      // Handle custom app errors
      if (error instanceof AppError) {
        return errorResponse(error, {
          status: error.statusCode,
          details: error instanceof ValidationError ? error.details : undefined,
        });
      }

      // Handle generic errors
      return errorResponse(
        error instanceof Error ? error.message : "Internal server error",
        { status: 500 }
      );
    }
  };
}

/**
 * Helper to extract params from Next.js route context
 * Handles both Promise and direct params (for Next.js 16 compatibility)
 */
export async function getRouteParams(
  context?: { params?: Promise<{ [key: string]: string }> | { [key: string]: string } }
): Promise<{ [key: string]: string }> {
  if (!context?.params) {
    return {};
  }
  
  if (context.params instanceof Promise) {
    return await context.params;
  }
  
  return context.params;
}

/**
 * Extract pagination parameters from query string
 */
export function extractPaginationParams(request: NextRequest): {
  page: number;
  limit: number;
} {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "10", 10))
  );

  return { page, limit };
}
