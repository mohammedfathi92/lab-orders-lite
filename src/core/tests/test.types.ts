export interface Test {
  id: string;
  code: string;
  name: string;
  price: number;
  turnaroundDays: number;
  isAvailable: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTestDTO {
  code: string;
  name: string;
  price: number;
  turnaroundDays: number;
  isAvailable?: boolean;
}

export interface UpdateTestDTO {
  code?: string;
  name?: string;
  price?: number;
  turnaroundDays?: number;
  isAvailable?: boolean;
}

export interface TestFilters {
  name?: string;
  isAvailable?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string; // General search across name
}
