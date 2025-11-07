import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { createTestDatabase, cleanupTestDatabase } from "../setup/test-db";
import { PrismaClient, Gender } from "@prisma/client";
import { POST } from "@/app/api/patients/route";
import { NextRequest } from "next/server";

// Mock the prisma module before importing routes
vi.mock("@/lib/prisma", () => ({
  prisma: {} as PrismaClient,
  prismaRaw: {} as PrismaClient,
}));

describe("POST /api/patients", () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = await createTestDatabase();
    
    // Replace the mocked prisma with our test database
    const prismaModule = await import("@/lib/prisma");
    vi.mocked(prismaModule).prisma = prisma;
    vi.mocked(prismaModule).prismaRaw = prisma;
  });

  afterAll(async () => {
    await cleanupTestDatabase(prisma);
  });

  beforeEach(async () => {
    // Clean up data before each test
    await prisma.orderTest.deleteMany();
    await prisma.order.deleteMany();
    await prisma.patient.deleteMany();
  });

  it("should create a patient successfully", async () => {
    const patientData = {
      name: "John Doe",
      dob: "1990-01-15T00:00:00.000Z",
      gender: "MALE" as Gender,
      phone: "+1234567890",
      address: "123 Main St",
    };

    const request = new NextRequest("http://localhost:3000/api/patients", {
      method: "POST",
      body: JSON.stringify(patientData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toMatchObject({
      name: patientData.name,
      gender: patientData.gender,
      phone: patientData.phone,
      address: patientData.address,
    });
    expect(data.data.id).toBeDefined();
    expect(data.message).toBe("Patient created successfully");
  });

  it("should return validation error for invalid data", async () => {
    const invalidData = {
      name: "", // Empty name should fail validation
      dob: "invalid-date",
      gender: "INVALID",
    };

    const request = new NextRequest("http://localhost:3000/api/patients", {
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

  it("should create patient with minimal required fields", async () => {
    const minimalData = {
      name: "Jane Smith",
      dob: "1985-05-20T00:00:00.000Z",
      gender: "FEMALE" as Gender,
    };

    const request = new NextRequest("http://localhost:3000/api/patients", {
      method: "POST",
      body: JSON.stringify(minimalData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe(minimalData.name);
    expect(data.data.gender).toBe(minimalData.gender);
  });
});