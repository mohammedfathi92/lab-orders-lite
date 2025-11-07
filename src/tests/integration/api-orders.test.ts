import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { createTestDatabase, cleanupTestDatabase } from "../setup/test-db";
import { PrismaClient, Gender } from "@prisma/client";
import { POST } from "@/app/api/orders/route";
import { NextRequest } from "next/server";

// Mock the prisma module before importing routes
vi.mock("@/lib/prisma", () => ({
  prisma: {} as PrismaClient,
  prismaRaw: {} as PrismaClient,
}));

describe("POST /api/orders", () => {
  let prisma: PrismaClient;
  let patientId: string;
  let testIds: string[];

  beforeAll(async () => {
    prisma = await createTestDatabase();
    
    // Replace the mocked prisma with our test database
    const prismaModule = await import("@/lib/prisma");
    vi.mocked(prismaModule).prisma = prisma;
    vi.mocked(prismaModule).prismaRaw = prisma;

    // Create a test patient
    const patient = await prisma.patient.create({
      data: {
        name: "Test Patient",
        dob: new Date("1990-01-01"),
        gender: Gender.MALE,
      },
    });
    patientId = patient.id;

    // Create test tests
    const test1 = await prisma.test.create({
      data: {
        code: "BLD",
        name: "Blood Test",
        price: 100.0,
        turnaroundDays: 1,
        isAvailable: true,
      },
    });

    const test2 = await prisma.test.create({
      data: {
        code: "XRY",
        name: "X-Ray",
        price: 200.0,
        turnaroundDays: 2,
        isAvailable: true,
      },
    });

    testIds = [test1.id, test2.id];
  });

  afterAll(async () => {
    await cleanupTestDatabase(prisma);
  });

  beforeEach(async () => {
    // Clean up orders before each test
    await prisma.orderTest.deleteMany();
    await prisma.order.deleteMany();
  });

  it("should create an order and calculate total cost correctly", async () => {
    const orderData = {
      patientId,
      testIds,
    };

    const request = new NextRequest("http://localhost:3000/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.totalCost).toBe(300.0); // 100 + 200
    expect(data.data.patientId).toBe(patientId);
    expect(data.message).toBe("Order created successfully");
  });

  it("should calculate ready date based on maximum turnaround days", async () => {
    const orderData = {
      patientId,
      testIds,
    };

    const request = new NextRequest("http://localhost:3000/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const beforeDate = new Date();
    beforeDate.setDate(beforeDate.getDate() + 2); // Max turnaround is 2 days

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.readyDate).toBeDefined();

    const readyDate = new Date(data.data.readyDate);
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + 2); // Max turnaround days

    // Allow 1 second difference for test execution time
    const timeDiff = Math.abs(readyDate.getTime() - expectedDate.getTime());
    expect(timeDiff).toBeLessThan(1000);
  });

  it("should return validation error for missing patient", async () => {
    const invalidData = {
      testIds,
    };

    const request = new NextRequest("http://localhost:3000/api/orders", {
      method: "POST",
      body: JSON.stringify(invalidData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("should return validation error for empty testIds", async () => {
    const invalidData = {
      patientId,
      testIds: [],
    };

    const request = new NextRequest("http://localhost:3000/api/orders", {
      method: "POST",
      body: JSON.stringify(invalidData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("should include order tests in response", async () => {
    const orderData = {
      patientId,
      testIds,
    };

    const request = new NextRequest("http://localhost:3000/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.orderTests).toBeDefined();
    expect(data.data.orderTests.length).toBe(2);
    expect(data.data.orderTests[0].test).toBeDefined();
    expect(data.data.orderTests[1].test).toBeDefined();
  });
});
