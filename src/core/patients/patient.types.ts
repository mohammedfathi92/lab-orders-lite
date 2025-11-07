import { Gender } from "@prisma/client";

export interface Patient {
  id: string;
  name: string;
  dob: Date;
  phone: string | null;
  gender: Gender;
  address: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePatientDTO {
  name: string;
  dob: Date | string;
  phone?: string | null;
  gender: Gender;
  address?: string | null;
}

export interface UpdatePatientDTO {
  name?: string;
  dob?: Date | string;
  phone?: string | null;
  gender?: Gender;
  address?: string | null;
}

export interface PatientFilters {
  name?: string;
  gender?: Gender;
  phone?: string;
  search?: string; // General search across name, phone, address
}
