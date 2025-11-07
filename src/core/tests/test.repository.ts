import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Test, CreateTestDTO, UpdateTestDTO, TestFilters } from "./test.types";

export class TestRepository {
  /**
   * Create a new test
   */
  async create(data: CreateTestDTO): Promise<Test> {
    const test = await prisma.test.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        price: data.price,
        turnaroundDays: data.turnaroundDays,
        isAvailable: data.isAvailable ?? true,
      },
    });

    return test as Test;
  }

  /**
   * Find a test by ID
   */
  async findById(id: string): Promise<Test | null> {
    const test = await prisma.test.findUnique({
      where: { id },
    });

    return test as Test | null;
  }

  /**
   * Find multiple tests by IDs
   */
  async findByIds(ids: string[]): Promise<Test[]> {
    const tests = await prisma.test.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return tests as Test[];
  }

  /**
   * Find all tests with optional filters
   */
  async findAll(filters?: TestFilters): Promise<Test[]> {
    const where: Prisma.TestWhereInput = {};

    if (filters?.name) {
      where.name = {
        contains: filters.name,
        mode: "insensitive",
      };
    }

    if (filters?.isAvailable !== undefined) {
      where.isAvailable = filters.isAvailable;
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters?.search) {
      where.name = {
        contains: filters.search,
        mode: "insensitive",
      };
    }

    const tests = await prisma.test.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return tests as Test[];
  }

  /**
   * Update a test by ID
   */
  async update(id: string, data: UpdateTestDTO): Promise<Test> {
    const updateData: Prisma.TestUpdateInput = {};

    if (data.code !== undefined) {
      updateData.code = data.code.toUpperCase();
    }

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.price !== undefined) {
      updateData.price = data.price;
    }

    if (data.turnaroundDays !== undefined) {
      updateData.turnaroundDays = data.turnaroundDays;
    }

    if (data.isAvailable !== undefined) {
      updateData.isAvailable = data.isAvailable;
    }

    const test = await prisma.test.update({
      where: { id },
      data: updateData,
    });

    return test as Test;
  }

  /**
   * Delete a test by ID (soft delete)
   */
  async delete(id: string): Promise<Test> {
    const test = await prisma.test.delete({
      where: { id },
    });

    return test as Test;
  }

  /**
   * Check if a test exists by ID
   */
  async exists(id: string): Promise<boolean> {
    const test = await prisma.test.findUnique({
      where: { id },
      select: { id: true },
    });

    return !!test;
  }

  /**
   * Count tests with optional filters
   */
  async count(filters?: TestFilters): Promise<number> {
    const where: Prisma.TestWhereInput = {};

    if (filters?.name) {
      where.name = {
        contains: filters.name,
        mode: "insensitive",
      };
    }

    if (filters?.isAvailable !== undefined) {
      where.isAvailable = filters.isAvailable;
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters?.search) {
      where.name = {
        contains: filters.search,
        mode: "insensitive",
      };
    }

    return await prisma.test.count({ where });
  }
}
