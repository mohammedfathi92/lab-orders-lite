import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Order, CreateOrderDTO, UpdateOrderDTO, OrderFilters, OrderWithDetails } from "./order.types";

export class OrderRepository {
  /**
   * Create a new order with order tests
   */
  async create(data: CreateOrderDTO, totalCost: number, readyDate: Date): Promise<Order> {
    const order = await prisma.order.create({
      data: {
        patientId: data.patientId,
        totalCost,
        readyDate,
        status: data.status || "PENDING",
        orderTests: {
          create: data.testIds.map((testId) => ({
            testId,
          })),
        },
      },
      include: {
        patient: true,
        orderTests: {
          include: {
            test: true,
          },
        },
      },
    });

    return order as Order;
  }

  /**
   * Find an order by ID
   */
  async findById(id: string, includeDetails = false): Promise<Order | OrderWithDetails | null> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: includeDetails
        ? {
            patient: true,
            orderTests: {
              include: {
                test: true,
              },
            },
          }
        : undefined,
    });

    return order as Order | OrderWithDetails | null;
  }

  /**
   * Find all orders with optional filters and pagination
   */
  async findAll(
    filters?: OrderFilters,
    includeDetails = false,
    pagination?: { page: number; limit: number }
  ): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    const where: Prisma.OrderWhereInput = {};

    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.minTotalCost !== undefined || filters?.maxTotalCost !== undefined) {
      where.totalCost = {};
      if (filters.minTotalCost !== undefined) {
        where.totalCost.gte = filters.minTotalCost;
      }
      if (filters.maxTotalCost !== undefined) {
        where.totalCost.lte = filters.maxTotalCost;
      }
    }

    if (filters?.readyDateFrom || filters?.readyDateTo) {
      where.readyDate = {};
      if (filters.readyDateFrom) {
        where.readyDate.gte =
          filters.readyDateFrom instanceof Date
            ? filters.readyDateFrom
            : new Date(filters.readyDateFrom);
      }
      if (filters.readyDateTo) {
        where.readyDate.lte =
          filters.readyDateTo instanceof Date
            ? filters.readyDateTo
            : new Date(filters.readyDateTo);
      }
    }

    // Add search filter for patient name
    if (filters?.search) {
      where.patient = {
        name: {
          contains: filters.search,
          mode: "insensitive",
        },
      };
    }

    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: includeDetails
          ? {
              patient: true,
              orderTests: {
                include: {
                  test: true,
                },
              },
            }
          : undefined,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: data as Order[],
      total,
      page,
      limit,
    };
  }

  /**
   * Find orders by patient ID
   */
  async findByPatientId(patientId: string, includeDetails = false): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      where: { patientId },
      include: includeDetails
        ? {
            patient: true,
            orderTests: {
              include: {
                test: true,
              },
            },
          }
        : undefined,
      orderBy: {
        createdAt: "desc",
      },
    });

    return orders as Order[];
  }

  /**
   * Update an order
   */
  async update(id: string, data: UpdateOrderDTO, totalCost?: number, readyDate?: Date): Promise<Order> {
    const updateData: Prisma.OrderUpdateInput = {};

    if (data.patientId !== undefined) {
      updateData.patient = {
        connect: { id: data.patientId },
      };
    }

    if (totalCost !== undefined) {
      updateData.totalCost = totalCost;
    }

    if (readyDate !== undefined) {
      updateData.readyDate = readyDate instanceof Date ? readyDate : new Date(readyDate);
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    // If testIds are provided, update the order tests
    if (data.testIds !== undefined) {
      // Delete existing order tests
      await prisma.orderTest.deleteMany({
        where: { orderId: id },
      });

      // Create new order tests
      updateData.orderTests = {
        create: data.testIds.map((testId) => ({
          testId,
        })),
      };
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        patient: true,
        orderTests: {
          include: {
            test: true,
          },
        },
      },
    });

    return order as Order;
  }

  /**
   * Delete an order by ID (soft delete)
   */
  async delete(id: string): Promise<Order> {
    const order = await prisma.order.delete({
      where: { id },
    });

    return order as Order;
  }

  /**
   * Check if an order exists by ID
   */
  async exists(id: string): Promise<boolean> {
    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true },
    });

    return !!order;
  }

  /**
   * Count orders with optional filters
   */
  async count(filters?: OrderFilters): Promise<number> {
    const where: Prisma.OrderWhereInput = {};

    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.minTotalCost !== undefined || filters?.maxTotalCost !== undefined) {
      where.totalCost = {};
      if (filters.minTotalCost !== undefined) {
        where.totalCost.gte = filters.minTotalCost;
      }
      if (filters.maxTotalCost !== undefined) {
        where.totalCost.lte = filters.maxTotalCost;
      }
    }

    if (filters?.readyDateFrom || filters?.readyDateTo) {
      where.readyDate = {};
      if (filters.readyDateFrom) {
        where.readyDate.gte =
          filters.readyDateFrom instanceof Date
            ? filters.readyDateFrom
            : new Date(filters.readyDateFrom);
      }
      if (filters.readyDateTo) {
        where.readyDate.lte =
          filters.readyDateTo instanceof Date
            ? filters.readyDateTo
            : new Date(filters.readyDateTo);
      }
    }

    // Add search filter for patient name
    if (filters?.search) {
      where.patient = {
        name: {
          contains: filters.search,
          mode: "insensitive",
        },
      };
    }

    return await prisma.order.count({ where });
  }
}
