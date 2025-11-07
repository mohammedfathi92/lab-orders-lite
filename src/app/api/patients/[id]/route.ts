import { NextRequest } from "next/server";
import { getPatientService } from "@/core/services";
import { apiHandler, getRouteParams } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";

const patientService = getPatientService();

/**
 * GET /api/patients/[id]
 * Get a patient by ID
 */
export const GET = apiHandler<unknown, { id: string }>(async (request: NextRequest, context) => {
  if (!context) {
    throw new Error("Route params are required");
  }
  const params = await getRouteParams(context);
  if (!params.id) {
    throw new Error("Patient ID is required");
  }
  const patient = await patientService.getPatientById(params.id);
  return successResponse(patient);
});

/**
 * PATCH /api/patients/[id]
 * Update a patient by ID
 */
export const PATCH = apiHandler<unknown, { id: string }>(async (request: NextRequest, context) => {
  if (!context) {
    throw new Error("Route params are required");
  }
  const params = await getRouteParams(context);
  if (!params.id) {
    throw new Error("Patient ID is required");
  }
  const body = await request.json();
  const patient = await patientService.updatePatient(params.id, body);
  return successResponse(patient, {
    message: "Patient updated successfully",
  });
});

