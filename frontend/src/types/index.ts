/**
 * User roles for Role-Based Access Control (RBAC)
 */
export type UserRole = 'ADMIN' | 'SERVICE_ADVISOR' | 'MECHANIC';

/**
 * Service ticket statuses mapping to the Kanban board columns
 */
export type TicketStatus = 'PENDING' | 'IN_PROGRESS' | 'WAITING_FOR_PARTS' | 'COMPLETED' | 'DELIVERED';

/**
 * Represents a system user
 */
export interface User {
  id: number;
  username: string;
  role: UserRole;
  fullName: string;
}

/**
 * Represents a customer
 */
export interface Customer {
  id: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Represents a customer's vehicle
 */
export interface Vehicle {
  id: number;
  customerId: number;
  licensePlate: string;
  vin: string;
  brand: string;
  model: string;
  year: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Represents a spare part in inventory
 */
export interface SparePart {
  id: number;
  partNumber: string;
  name: string;
  description?: string;
  unitPrice: number;
  stockQuantity: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Represents a single line item of a service ticket
 */
export interface TicketItem {
  id: number;
  partId: number;
  partNumber: string;
  partName: string;
  quantity: number;
  pricePerUnit: number;
  subtotal: number;
  createdAt?: string;
}

/**
 * Represents a service ticket with full details and billing breakdown
 * (Mirrors ServiceTicketResponse.java)
 */
export interface ServiceTicket {
  id: number;
  description: string;
  status: TicketStatus;

  // Billing breakdown (computed in real-time)
  laborCost: number;
  partsTotal: number;
  subtotal: number;        // laborCost + partsTotal
  vatAmount: number;       // subtotal * 7%
  totalWithVat: number;    // subtotal + vatAmount

  // Vehicle info
  vehicleId: number;
  licensePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;

  // Customer info
  customerId: number;
  customerName: string;
  customerPhone: string;

  // Assigned mechanic info
  mechanicId: number | null;
  mechanicName: string | null;

  // Line items
  items: TicketItem[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Request payload for creating a new service ticket
 */
export interface CreateTicketRequest {
  vehicleId: number;
  description: string;
  laborCost: number;
  mechanicId?: number | null;
}

/**
 * Request payload for updating an existing service ticket
 */
export interface UpdateTicketRequest {
  description?: string;
  laborCost?: number;
  mechanicId?: number | null;
}

/**
 * Request payload for changing the status of a service ticket
 */
export interface UpdateTicketStatusRequest {
  status: TicketStatus;
}

/**
 * Request payload for adding a spare part line item
 */
export interface AddTicketItemRequest {
  partId: number;
  quantity: number;
}

/**
 * Standard API response wrapper
 * (Mirrors ApiResponse.java)
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}
