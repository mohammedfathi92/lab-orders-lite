import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";

interface Order {
  id: string;
  patientId: string;
  totalCost: number;
  readyDate: string;
  status: OrderStatus;
  patient?: {
    id: string; 
    name: string;
  };
}

interface OrdersResponse {
  success: boolean;
  data: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface OrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  patientId?: string;
  minTotalCost?: number;
  maxTotalCost?: number;
}

export function useOrders(params: OrdersParams = {}) {
  return useQuery<OrdersResponse>({
    queryKey: ["orders", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());
      if (params.search) searchParams.set("search", params.search);
      if (params.status) searchParams.set("status", params.status);
      if (params.patientId) searchParams.set("patientId", params.patientId);
      if (params.minTotalCost) searchParams.set("minTotalCost", params.minTotalCost.toString());
      if (params.maxTotalCost) searchParams.set("maxTotalCost", params.maxTotalCost.toString());

      const response = await fetch(`/api/orders?${searchParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { patientId: string; testIds: string[] }) => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create order");
      }
      return response.json();
    },
    onMutate: async (newOrder) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["orders"] });

      // Snapshot previous value
      const previousOrders = queryClient.getQueryData<OrdersResponse>(["orders"]);

      // Optimistically update
      if (previousOrders) {
        queryClient.setQueryData<OrdersResponse>(["orders"], {
          ...previousOrders,
          data: [
            {
              id: `temp-${Date.now()}`,
              patientId: newOrder.patientId,
              totalCost: 0, // Will be updated on success
              readyDate: new Date().toISOString(),
              status: "PENDING",
            },
            ...previousOrders.data,
          ],
          pagination: {
            ...previousOrders.pagination,
            total: previousOrders.pagination.total + 1,
          },
        });
      }

      return { previousOrders };
    },
    onError: (err, newOrder, context) => {
      // Rollback on error
      if (context?.previousOrders) {
        queryClient.setQueryData(["orders"], context.previousOrders);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        status?: OrderStatus;
        patientId?: string;
        testIds?: string[];
      };
    }) => {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update order");
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate all order queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      // Also invalidate the specific order query
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
    },
  });
}
