export interface ICustomer {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  phone: string;
  isActive?: boolean;
  totalBookings: number;
  createdAt: Date;
  updatedAt: Date;
}
