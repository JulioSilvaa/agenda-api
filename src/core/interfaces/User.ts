export enum UserRole {
  ADMIN = "ADMIN",
  STAFF = "STAFF",
}

export interface IUser {
  id?: string;
  tenantId: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
