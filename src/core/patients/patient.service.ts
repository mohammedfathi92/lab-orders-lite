import { z } from "zod";
import { Gender } from "@prisma/client";
import { PatientRepository } from "./patient.repository";
import { CreatePatientDTO, UpdatePatientDTO, PatientFilters } from "./patient.types";
import { ConflictError } from "@/lib/errors";

// Zod schemas for validation
const genderEnum = z.nativeEnum(Gender);

const createPatientSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  dob: z.union([
    z.date(),
    z.string().datetime(),
    z.string().refine(
      (val) => !isNaN(Date.parse(val)),
      "Invalid date format. Please use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ)"
    ),
  ]).transform((val) => {
    if (val instanceof Date) return val;
    return new Date(val);
  }).refine(
    (date) => date instanceof Date && !isNaN(date.getTime()),
    "Invalid date"
  ),
  phone: z.string().max(20, "Phone number is too long").nullable().optional(),
  gender: genderEnum,
  address: z.string().max(500, "Address is too long").nullable().optional(),
});

const updatePatientSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long").optional(),
  dob: z.union([
    z.date(),
    z.string().datetime(),
    z.string().refine(
      (val) => !isNaN(Date.parse(val)),
      "Invalid date format. Please use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ)"
    ),
  ]).transform((val) => {
    if (val instanceof Date) return val;
    return new Date(val);
  }).refine(
    (date) => date instanceof Date && !isNaN(date.getTime()),
    "Invalid date"
  ).optional(),
  phone: z.string().max(20, "Phone number is too long").nullable().optional(),
  gender: genderEnum.optional(),
  address: z.string().max(500, "Address is too long").nullable().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  "At least one field must be provided for update"
);

const patientFiltersSchema = z.object({
  name: z.string().optional(),
  gender: genderEnum.optional(),
  phone: z.string().optional(),
  search: z.string().optional(),
});

export class PatientService {
  private repository: PatientRepository;

  constructor() {
    this.repository = new PatientRepository();
  }

  /**
   * Create a new patient with validation
   */
  async create(data: unknown): Promise<CreatePatientDTO> {
    const validatedData = createPatientSchema.parse(data);
    return validatedData;
  }

  /**
   * Validate and create a patient
   * Checks for duplicates before creating
   */
  async createPatient(data: unknown) {
    const validatedData = await this.create(data);
    
    // Check if patient already exists (same name + DOB)
    const existingPatient = await this.repository.findDuplicate(validatedData);
    
    if (existingPatient) {
      throw new ConflictError(
        `Patient already exists with the same name and date of birth. ` +
        `Existing patient ID: ${existingPatient.id}`
      );
    }
    
    return await this.repository.create(validatedData);
  }

  /**
   * Get a patient by ID
   */
  async getPatientById(id: string) {
    if (!id || typeof id !== "string") {
      throw new Error("Invalid patient ID");
    }

    const patient = await this.repository.findById(id);
    
    if (!patient) {
      throw new Error("Patient not found");
    }

    return patient;
  }

  /**
   * Get all patients with optional filters and pagination
   */
  async getAllPatients(
    filters?: unknown,
    pagination?: { page: number; limit: number }
  ) {
    let validatedFilters: PatientFilters | undefined;

    if (filters) {
      validatedFilters = patientFiltersSchema.parse(filters);
    }

    return await this.repository.findAll(validatedFilters, pagination);
  }

  /**
   * Update a patient with validation
   */
  async update(data: unknown): Promise<UpdatePatientDTO> {
    const validatedData = updatePatientSchema.parse(data);
    return validatedData;
  }

  /**
   * Validate and update a patient
   */
  async updatePatient(id: string, data: unknown) {
    if (!id || typeof id !== "string") {
      throw new Error("Invalid patient ID");
    }

    // Check if patient exists
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new Error("Patient not found");
    }

    const validatedData = await this.update(data);
    return await this.repository.update(id, validatedData);
  }

  /**
   * Delete a patient (soft delete)
   */
  async deletePatient(id: string) {
    if (!id || typeof id !== "string") {
      throw new Error("Invalid patient ID");
    }

    // Check if patient exists
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new Error("Patient not found");
    }

    return await this.repository.delete(id);
  }

  /**
   * Count patients with optional filters
   */
  async countPatients(filters?: unknown) {
    let validatedFilters: PatientFilters | undefined;

    if (filters) {
      validatedFilters = patientFiltersSchema.parse(filters);
    }

    return await this.repository.count(validatedFilters);
  }
}
