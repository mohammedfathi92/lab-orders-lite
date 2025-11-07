import { Patient } from "../patients/patient.types";
import { Test } from "../tests/test.types";

export interface OrderTest {
  id: string;
  orderId: string;
  testId: string;
  test?: Test;
}

export type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";

export interface Order {
  id: string;
  patientId: string;
  totalCost: number;
  readyDate: Date;
  status: OrderStatus;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  patient?: Patient;
  orderTests?: OrderTest[];
}

export interface CreateOrderDTO {
  patientId: string;
  testIds: string[];
  status?: OrderStatus;
}

export interface UpdateOrderDTO {
  patientId?: string;
  testIds?: string[];
  status?: OrderStatus;
}

export interface OrderFilters {
  patientId?: string;
  status?: OrderStatus;
  minTotalCost?: number;
  maxTotalCost?: number;
  readyDateFrom?: Date | string;
  readyDateTo?: Date | string;
  search?: string; // Search by patient name
}

export interface OrderWithDetails extends Order {
  patient: Patient;
  orderTests: Array<OrderTest & { test: Test }>;
}
