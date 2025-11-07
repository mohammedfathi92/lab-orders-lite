import { z } from "zod";
import { TestRepository } from "./test.repository";
import { CreateTestDTO, UpdateTestDTO, TestFilters } from "./test.types";

// Zod schemas for validation
const createTestSchema = z.object({
  code: z.string().min(1, "Code is required").max(50, "Code is too long").regex(/^[A-Z0-9_-]+$/, "Code must contain only uppercase letters, numbers, hyphens, and underscores"),
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  price: z.number().positive("Price must be positive").max(999999, "Price is too high"),
  turnaroundDays: z.number().int("Turnaround days must be an integer").min(0, "Turnaround days cannot be negative").max(365, "Turnaround days is too high"),
  isAvailable: z.boolean().optional().default(true),
});

const updateTestSchema = z.object({
  code: z.string().min(1, "Code is required").max(50, "Code is too long").regex(/^[A-Z0-9_-]+$/, "Code must contain only uppercase letters, numbers, hyphens, and underscores").optional(),
  name: z.string().min(1, "Name is required").max(255, "Name is too long").optional(),
  price: z.number().positive("Price must be positive").max(999999, "Price is too high").optional(),
  turnaroundDays: z.number().int("Turnaround days must be an integer").min(0, "Turnaround days cannot be negative").max(365, "Turnaround days is too high").optional(),
  isAvailable: z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  "At least one field must be provided for update"
);

const testFiltersSchema = z.object({
  name: z.string().optional(),
  isAvailable: z.boolean().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  search: z.string().optional(),
}).refine(
  (data) => {
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
      return data.minPrice <= data.maxPrice;
    }
    return true;
  },
  {
    message: "Minimum price must be less than or equal to maximum price",
    path: ["minPrice"],
  }
);

export class TestService {
  private repository: TestRepository;

  constructor() {
    this.repository = new TestRepository();
  }

  /**
   * Create a new test with validation
   */
  async create(data: unknown): Promise<CreateTestDTO> {
    const validatedData = createTestSchema.parse(data);
    return validatedData;
  }

  /**
   * Validate and create a test
   */
  async createTest(data: unknown) {
    const validatedData = await this.create(data);
    return await this.repository.create(validatedData);
  }

  /**
   * Get a test by ID
   */
  async getTestById(id: string) {
    if (!id || typeof id !== "string") {
      throw new Error("Invalid test ID");
    }

    const test = await this.repository.findById(id);
    
    if (!test) {
      throw new Error("Test not found");
    }

    return test;
  }

  /**
   * Get multiple tests by IDs
   */
  async getTestsByIds(ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Invalid test IDs");
    }

    return await this.repository.findByIds(ids);
  }

  /**
   * Get all tests with optional filters
   */
  async getAllTests(filters?: unknown) {
    let validatedFilters: TestFilters | undefined;

    if (filters) {
      validatedFilters = testFiltersSchema.parse(filters);
    }

    return await this.repository.findAll(validatedFilters);
  }

  /**
   * Update a test with validation
   */
  async update(data: unknown): Promise<UpdateTestDTO> {
    const validatedData = updateTestSchema.parse(data);
    return validatedData;
  }

  /**
   * Validate and update a test
   */
  async updateTest(id: string, data: unknown) {
    if (!id || typeof id !== "string") {
      throw new Error("Invalid test ID");
    }

    // Check if test exists
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new Error("Test not found");
    }

    const validatedData = await this.update(data);
    return await this.repository.update(id, validatedData);
  }

  /**
   * Delete a test (soft delete)
   */
  async deleteTest(id: string) {
    if (!id || typeof id !== "string") {
      throw new Error("Invalid test ID");
    }

    // Check if test exists
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new Error("Test not found");
    }

    return await this.repository.delete(id);
  }

  /**
   * Count tests with optional filters
   */
  async countTests(filters?: unknown) {
    let validatedFilters: TestFilters | undefined;

    if (filters) {
      validatedFilters = testFiltersSchema.parse(filters);
    }

    return await this.repository.count(validatedFilters);
  }
}
