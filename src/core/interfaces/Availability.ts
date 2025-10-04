export interface IAvailability {
  id: string;
  tenantId: string;
  weekday: number; // 0-6 (Domingo-Sábado)
  startTime: string; // formato HH:MM
  endTime: string; // formato HH:MM
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
