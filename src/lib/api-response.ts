import { NextResponse } from "next/server";

/**
 * Standardized API response utilities
 */

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  options?: {
    status?: number;
    message?: string;
    pagination?: ApiSuccessResponse<T>["pagination"];
  }
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(options?.message && { message: options.message }),
    ...(options?.pagination && { pagination: options.pagination }),
  };

  return NextResponse.json(response, { status: options?.status ?? 200 });
}

/**
 * Create an error response
 */
export function errorResponse(
  error: string | Error,
  options?: {
    status?: number;
    details?: unknown;
  }
): NextResponse<ApiErrorResponse> {
  const errorMessage = error instanceof Error ? error.message : error;

  const response: ApiErrorResponse = {
    success: false,
    error: errorMessage,
    ...(options?.details ? { details: options.details } : {}),
  };

  return NextResponse.json(response, { status: options?.status ?? 500 });
}

/**
 * Create a validation error response
 */
export function validationErrorResponse(
  details: unknown,
  status = 400
): NextResponse<ApiErrorResponse> {
  return errorResponse("Validation error", { status, details });
}
