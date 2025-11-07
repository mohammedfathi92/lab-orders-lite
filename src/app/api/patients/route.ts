import { NextRequest } from "next/server";
import { getPatientService } from "@/core/services";
import { apiHandler, extractPaginationParams } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";

const patientService = getPatientService();

/**
 * GET /api/patients
 * List all patients with optional filters and pagination
 * Query params: ?page=1&limit=10&search=John&name=John&gender=MALE&phone=123
 */
export const GET = apiHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const filters: Record<string, string> = {};

  if (searchParams.has("name")) {
    filters.name = searchParams.get("name")!;
  }
  if (searchParams.has("gender")) {
    filters.gender = searchParams.get("gender")!;
  }
  if (searchParams.has("phone")) {
    filters.phone = searchParams.get("phone")!;
  }
  if (searchParams.has("search")) {
    filters.search = searchParams.get("search")!;
  }

  const { page, limit } = extractPaginationParams(request);

  const result = await patientService.getAllPatients(
    Object.keys(filters).length > 0 ? filters : undefined,
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
 * POST /api/patients
 * Create a new patient
 */
export const POST = apiHandler(async (request: NextRequest) => {
  const body = await request.json();

  const patient = await patientService.createPatient(body);

  return successResponse(patient, {
    status: 201,
    message: "Patient created successfully",
  });
});
