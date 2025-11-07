import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Patient, CreatePatientDTO, UpdatePatientDTO, PatientFilters } from "./patient.types";

export class PatientRepository {
  /**
   * Create a new patient
   */
  async create(data: CreatePatientDTO): Promise<Patient> {
    const patient = await prisma.patient.create({
      data: {
        name: data.name,
        dob: typeof data.dob === "string" ? new Date(data.dob) : data.dob,
        phone: data.phone ?? null,
        gender: data.gender,
        address: data.address ?? null,
      },
    });

    return patient as Patient;
  }

  /**
   * Find a patient by ID
   */
  async findById(id: string): Promise<Patient | null> {
    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    return patient as Patient | null;
  }

  /**
   * Find all patients with optional filters and pagination
   */
  async findAll(
    filters?: PatientFilters,
    pagination?: { page: number; limit: number }
  ): Promise<{ data: Patient[]; total: number; page: number; limit: number }> {
    const where: Prisma.PatientWhereInput = {};

    if (filters?.name) {
      where.name = {
        contains: filters.name,
        mode: "insensitive",
      };
    }

    if (filters?.gender) {
      where.gender = filters.gender;
    }

    if (filters?.phone) {
      where.phone = {
        contains: filters.phone,
        mode: "insensitive",
      };
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { phone: { contains: filters.search, mode: "insensitive" } },
        { address: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.patient.count({ where }),
    ]);

    return {
      data: data as Patient[],
      total,
      page,
      limit,
    };
  }

  /**
   * Update a patient by ID
   */
  async update(id: string, data: UpdatePatientDTO): Promise<Patient> {
    const updateData: Prisma.PatientUpdateInput = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.dob !== undefined) {
      updateData.dob = typeof data.dob === "string" ? new Date(data.dob) : data.dob;
    }

    if (data.phone !== undefined) {
      updateData.phone = data.phone;
    }

    if (data.gender !== undefined) {
      updateData.gender = data.gender;
    }

    if (data.address !== undefined) {
      updateData.address = data.address;
    }

    const patient = await prisma.patient.update({
      where: { id },
      data: updateData,
    });

    return patient as Patient;
  }

  /**
   * Delete a patient by ID (soft delete)
   */
  async delete(id: string): Promise<Patient> {
    const patient = await prisma.patient.delete({
      where: { id },
    });

    return patient as Patient;
  }

  /**
   * Check if a patient exists by ID
   */
  async exists(id: string): Promise<boolean> {
    const patient = await prisma.patient.findUnique({
      where: { id },
      select: { id: true },
    });

    return !!patient;
  }

  /**
   * Count patients with optional filters
   */
  async count(filters?: PatientFilters): Promise<number> {
    const where: Prisma.PatientWhereInput = {};

    if (filters?.name) {
      where.name = {
        contains: filters.name,
        mode: "insensitive",
      };
    }

    if (filters?.gender) {
      where.gender = filters.gender;
    }

    if (filters?.phone) {
      where.phone = {
        contains: filters.phone,
        mode: "insensitive",
      };
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { phone: { contains: filters.search, mode: "insensitive" } },
        { address: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return await prisma.patient.count({ where });
  }
}
