import { z } from "zod";
import { OrderRepository } from "./order.repository";
import { TestService } from "../tests/test.service";
import { PatientService } from "../patients/patient.service";
import { CreateOrderDTO, UpdateOrderDTO, OrderFilters } from "./order.types";

// Zod schemas for validation
const orderStatusEnum = z.enum(["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"]);

const createOrderSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  testIds: z
    .array(z.string().min(1, "Test ID is required"))
    .min(1, "At least one test is required"),
  status: orderStatusEnum.optional(),
});

const updateOrderSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required").optional(),
  testIds: z
    .array(z.string().min(1, "Test ID is required"))
    .min(1, "At least one test is required")
    .optional(),
  status: orderStatusEnum.optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  "At least one field must be provided for update"
);

const orderFiltersSchema = z.object({
  patientId: z.string().optional(),
  status: orderStatusEnum.optional(),
  minTotalCost: z.number().positive().optional(),
  maxTotalCost: z.number().positive().optional(),
  readyDateFrom: z.union([z.date(), z.string()]).optional(),
  readyDateTo: z.union([z.date(), z.string()]).optional(),
  search: z.string().optional(),
}).refine(
  (data) => {
    if (data.minTotalCost !== undefined && data.maxTotalCost !== undefined) {
      return data.minTotalCost <= data.maxTotalCost;
    }
    return true;
  },
  {
    message: "Minimum total cost must be less than or equal to maximum total cost",
    path: ["minTotalCost"],
  }
).refine(
  (data) => {
    if (data.readyDateFrom && data.readyDateTo) {
      const from = data.readyDateFrom instanceof Date ? data.readyDateFrom : new Date(data.readyDateFrom);
      const to = data.readyDateTo instanceof Date ? data.readyDateTo : new Date(data.readyDateTo);
      return from <= to;
    }
    return true;
  },
  {
    message: "Ready date from must be before or equal to ready date to",
    path: ["readyDateFrom"],
  }
);

export class OrderService {
  private repository: OrderRepository;
  private testService: TestService;
  private patientService: PatientService;

  constructor() {
    this.repository = new OrderRepository();
    this.testService = new TestService();
    this.patientService = new PatientService();
  }

  /**
   * Calculate total cost from test IDs
   */
  private async calculateTotalCost(testIds: string[]): Promise<number> {
    const tests = await this.testService.getTestsByIds(testIds);
    
    if (tests.length !== testIds.length) {
      throw new Error("One or more tests not found");
    }

    // Check if all tests are available
    const unavailableTests = tests.filter((test) => !test.isAvailable);
    if (unavailableTests.length > 0) {
      throw new Error(
        `The following tests are not available: ${unavailableTests.map((t) => t.name).join(", ")}`
      );
    }

    return tests.reduce((total, test) => total + test.price, 0);
  }

  /**
   * Calculate ready date based on maximum turnaround days
   */
  private async calculateReadyDate(testIds: string[]): Promise<Date> {
    const tests = await this.testService.getTestsByIds(testIds);
    
    if (tests.length !== testIds.length) {
      throw new Error("One or more tests not found");
    }

    const maxTurnaroundDays = Math.max(...tests.map((test) => test.turnaroundDays));
    const readyDate = new Date();
    readyDate.setDate(readyDate.getDate() + maxTurnaroundDays);
    
    return readyDate;
  }

  /**
   * Create a new order with validation
   */
  async create(data: unknown): Promise<CreateOrderDTO> {
    const validatedData = createOrderSchema.parse(data);
    return validatedData;
  }

  /**
   * Validate and create an order
   */
  async createOrder(data: unknown) {
    const validatedData = await this.create(data);

    // Verify patient exists
    await this.patientService.getPatientById(validatedData.patientId);

    // Calculate total cost and ready date
    const totalCost = await this.calculateTotalCost(validatedData.testIds);
    const readyDate = await this.calculateReadyDate(validatedData.testIds);

    return await this.repository.create(validatedData, totalCost, readyDate);
  }

  /**
   * Get an order by ID
   */
  async getOrderById(id: string, includeDetails = false) {
    if (!id || typeof id !== "string") {
      throw new Error("Invalid order ID");
    }

    const order = await this.repository.findById(id, includeDetails);
    
    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  }

  /**
   * Get all orders with optional filters and pagination
   */
  async getAllOrders(
    filters?: unknown,
    includeDetails = false,
    pagination?: { page: number; limit: number }
  ) {
    let validatedFilters: OrderFilters | undefined;

    if (filters) {
      const parsed = orderFiltersSchema.parse(filters);
      validatedFilters = {
        ...parsed,
        readyDateFrom: parsed.readyDateFrom
          ? parsed.readyDateFrom instanceof Date
            ? parsed.readyDateFrom
            : new Date(parsed.readyDateFrom)
          : undefined,
        readyDateTo: parsed.readyDateTo
          ? parsed.readyDateTo instanceof Date
            ? parsed.readyDateTo
            : new Date(parsed.readyDateTo)
          : undefined,
      };
    }

    return await this.repository.findAll(validatedFilters, includeDetails, pagination);
  }

  /**
   * Get orders by patient ID
   */
  async getOrdersByPatientId(patientId: string, includeDetails = false) {
    if (!patientId || typeof patientId !== "string") {
      throw new Error("Invalid patient ID");
    }

    return await this.repository.findByPatientId(patientId, includeDetails);
  }

  /**
   * Update an order with validation
   */
  async update(data: unknown): Promise<UpdateOrderDTO> {
    const validatedData = updateOrderSchema.parse(data);
    return validatedData;
  }

  /**
   * Validate and update an order
   */
  async updateOrder(id: string, data: unknown) {
    if (!id || typeof id !== "string") {
      throw new Error("Invalid order ID");
    }

    // Check if order exists
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new Error("Order not found");
    }

    const validatedData = await this.update(data);

    // If patientId is being updated, verify it exists
    if (validatedData.patientId) {
      await this.patientService.getPatientById(validatedData.patientId);
    }

    // If testIds are being updated, recalculate total cost and ready date
    let totalCost: number | undefined;
    let readyDate: Date | undefined;

    if (validatedData.testIds) {
      totalCost = await this.calculateTotalCost(validatedData.testIds);
      readyDate = await this.calculateReadyDate(validatedData.testIds);
    }

    return await this.repository.update(id, validatedData, totalCost, readyDate);
  }

  /**
   * Delete an order (soft delete)
   */
  async deleteOrder(id: string) {
    if (!id || typeof id !== "string") {
      throw new Error("Invalid order ID");
    }

    // Check if order exists
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new Error("Order not found");
    }

    return await this.repository.delete(id);
  }

  /**
   * Count orders with optional filters
   */
  async countOrders(filters?: unknown) {
    let validatedFilters: OrderFilters | undefined;

    if (filters) {
      const parsed = orderFiltersSchema.parse(filters);
      validatedFilters = {
        ...parsed,
        readyDateFrom: parsed.readyDateFrom
          ? parsed.readyDateFrom instanceof Date
            ? parsed.readyDateFrom
            : new Date(parsed.readyDateFrom)
          : undefined,
        readyDateTo: parsed.readyDateTo
          ? parsed.readyDateTo instanceof Date
            ? parsed.readyDateTo
            : new Date(parsed.readyDateTo)
          : undefined,
      };
    }

    return await this.repository.count(validatedFilters);
  }
}
