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
        name: data.name.trim(), // Trim whitespace for consistency
        dob: typeof data.dob === "string" ? new Date(data.dob) : data.dob,
        phone: data.phone?.trim() ?? null, // Trim phone if provided
        gender: data.gender,
        address: data.address?.trim() ?? null, // Trim address if provided
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
   * Normalize name by splitting into words, lowercasing, and filtering out empty strings
   */
  private normalizeNameToWords(name: string): string[] {
    return name
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  /**
   * Check if two names share all words (word-based matching)
   * Returns true if all words from the shorter name exist in the longer name
   */
  private namesMatchWordBased(name1: string, name2: string): boolean {
    const words1 = this.normalizeNameToWords(name1);
    const words2 = this.normalizeNameToWords(name2);

    // If either name is empty, no match
    if (words1.length === 0 || words2.length === 0) {
      return false;
    }

    // Check if all words from the shorter name exist in the longer name
    const shorter = words1.length <= words2.length ? words1 : words2;
    const longer = words1.length > words2.length ? words1 : words2;

    // All words from shorter name must exist in longer name
    return shorter.every(word => longer.includes(word));
  }

  /**
   * Check if a patient with a similar name (word-based) and same date of birth already exists
   * 
   * Examples of matches:
   * - "Doe S Joe" matches "Doe Joe" (all words from shorter name exist in longer)
   * - "Joe Doe" matches "Joe s Doe" (all words from shorter name exist in longer)
   * - "John Smith" matches "John Michael Smith" (all words from shorter name exist in longer)
   */
  async findDuplicate(data: CreatePatientDTO): Promise<Patient | null> {
    const dob = typeof data.dob === "string" ? new Date(data.dob) : data.dob;
    
    // Normalize date to compare only date part (ignore time)
    // Use UTC to avoid timezone issues
    const dobDate = new Date(dob);
    const year = dobDate.getUTCFullYear();
    const month = dobDate.getUTCMonth();
    const day = dobDate.getUTCDate();
    
    // Create start and end of day in UTC
    const dobStart = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    const dobEnd = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

    // Normalize the new patient's name to words
    const newName = data.name.trim();
    const newNameWords = this.normalizeNameToWords(newName);
    
    // If no words in the name, skip duplicate check
    if (newNameWords.length === 0) {
      return null;
    }

    // Optimize: First check database for patients with similar names (contains any word from new name)
    // This reduces the number of records we need to check in memory
    // Build OR conditions for each word in the new name
    const nameFilters = newNameWords.map(word => ({
      name: {
        contains: word,
        mode: "insensitive" as const,  // Lines 222-223: Makes search case-insensitive
      },
    }));

    // Find patients with same DOB AND name contains at least one word from new name
    // Soft delete is automatically handled by Prisma extension (filters deletedAt: null)
    const patientsWithSameDOB = await prisma.patient.findMany({
      where: {
        dob: {
          gte: dobStart,
          lte: dobEnd,
        },
        OR: [...nameFilters, { deletedAt: null }], // Name must contain at least one word from the new name
      },
    });

    // Now check if any existing patient's name matches word-based (all words from shorter name in longer)
    for (const existingPatient of patientsWithSameDOB) {
      if (this.namesMatchWordBased(newName, existingPatient.name)) {
        return existingPatient as Patient;
      }
    }

    return null;
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
