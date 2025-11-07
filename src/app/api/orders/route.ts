import { NextRequest } from "next/server";
import { getOrderService } from "@/core/services";
import { apiHandler, extractPaginationParams } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";

const orderService = getOrderService();

/**
 * GET /api/orders
 * List all orders with optional filters and pagination
 * Includes patient and tests information
 * Query params: ?page=1&limit=10&search=Jane&patientId=xxx&minTotalCost=100&maxTotalCost=500
 */
export const GET = apiHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const filters: Record<string, string | number | Date> = {};

  if (searchParams.has("patientId")) {
    filters.patientId = searchParams.get("patientId")!;
  }
  if (searchParams.has("status")) {
    filters.status = searchParams.get("status")!;
  }
  if (searchParams.has("minTotalCost")) {
    filters.minTotalCost = parseFloat(searchParams.get("minTotalCost")!);
  }
  if (searchParams.has("maxTotalCost")) {
    filters.maxTotalCost = parseFloat(searchParams.get("maxTotalCost")!);
  }
  if (searchParams.has("readyDateFrom")) {
    filters.readyDateFrom = new Date(searchParams.get("readyDateFrom")!);
  }
  if (searchParams.has("readyDateTo")) {
    filters.readyDateTo = new Date(searchParams.get("readyDateTo")!);
  }
  if (searchParams.has("search")) {
    filters.search = searchParams.get("search")!;
  }

  const { page, limit } = extractPaginationParams(request);

  const result = await orderService.getAllOrders(
    Object.keys(filters).length > 0 ? filters : undefined,
    true, // includeDetails = true
    { page, limit }
  );

  return successResponse(result.data, {
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    },
  });
});

/**
 * POST /api/orders
 * Create a new order for a patient
 */
export const POST = apiHandler(async (request: NextRequest) => {
  const body = await request.json();

  const order = await orderService.createOrder(body);

  const orderWithDetails = await orderService.getOrderById(order.id, true);

  return successResponse(orderWithDetails, {
    status: 201,
    message: "Order created successfully",
  });
});
