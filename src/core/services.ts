/**
 * Service instances - Singleton pattern
 * Prevents multiple instances and ensures consistent state
 */

import { PatientService } from "./patients";
import { OrderService } from "./orders";
import { TestService } from "./tests";

// Singleton instances
let patientServiceInstance: PatientService | null = null;
let orderServiceInstance: OrderService | null = null;
let testServiceInstance: TestService | null = null;

/**
 * Get PatientService instance (singleton)
 */
export function getPatientService(): PatientService {
  if (!patientServiceInstance) {
    patientServiceInstance = new PatientService();
  }
  return patientServiceInstance;
}

/**
 * Get OrderService instance (singleton)
 */
export function getOrderService(): OrderService {
  if (!orderServiceInstance) {
    orderServiceInstance = new OrderService();
  }
  return orderServiceInstance;
}

/**
 * Get TestService instance (singleton)
 */
export function getTestService(): TestService {
  if (!testServiceInstance) {
    testServiceInstance = new TestService();
  }
  return testServiceInstance;
}
