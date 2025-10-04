export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface IBooking {
  id: string;
  tenantId: string;
  customerId?: string;
  serviceId?: string;
  staffUserId?: string;
  status: BookingStatus;
  requestedStart: Date;
  requestedEnd: Date;
  notes?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}
