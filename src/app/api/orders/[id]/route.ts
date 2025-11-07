import { NextRequest } from "next/server";
import { getOrderService } from "@/core/services";
import { apiHandler, getRouteParams } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";

const orderService = getOrderService();

/**
 * GET /api/orders/[id]
 * Get an order by ID with full details
 */
export const GET = apiHandler<unknown, { id: string }>(async (request: NextRequest, context) => {
  if (!context) {
    throw new Error("Route params are required");
  }
  const params = await getRouteParams(context);
  if (!params.id) {
    throw new Error("Order ID is required");
  }
  const order = await orderService.getOrderById(params.id, true);
  return successResponse(order);
});

/**
 * PATCH /api/orders/[id]
 * Update an order by ID
 */
export const PATCH = apiHandler<unknown, { id: string }>(async (request: NextRequest, context) => {
  if (!context) {
    throw new Error("Route params are required");
  }
  const params = await getRouteParams(context);
  if (!params.id) {
    throw new Error("Order ID is required");
  }
  const body = await request.json();
  const updatedOrder = await orderService.updateOrder(params.id, body);
  
  const orderWithDetails = await orderService.getOrderById(updatedOrder.id, true);
  
  return successResponse(orderWithDetails, {
    message: "Order updated successfully",
  });
});

