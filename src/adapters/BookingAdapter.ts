import { BookingEntity } from '../core/entities/BookingEntity';
import { BookingStatus, IBooking } from '../core/interfaces/Booking';

export default class BookingAdapter {
  static create(row: IBooking): BookingEntity {
    if (!row) throw new Error('Row inválido para criação de BookingEntity');
    return BookingEntity.create({
      id: row.id,
      tenantId: row.tenantId,
      customerId: row.customerId ?? undefined,
      serviceId: row.serviceId ?? undefined,
      staffUserId: row.staffUserId ?? undefined,
      status: row.status ?? BookingStatus.PENDING,
      requestedStart: new Date(row.requestedStart),
      requestedEnd: new Date(row.requestedEnd),
      notes: row.notes ?? undefined,
      rating: row.rating ?? undefined,
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
    });
  }

  static toDb(entity: BookingEntity) {
    return {
      id: entity.id ?? undefined,
      tenantId: entity.tenantId,
      customerId: entity.customerId ?? undefined,
      serviceId: entity.serviceId ?? undefined,
      staffUserId: entity.staffUserId ?? undefined,
      status: entity.status,
      requestedStart: entity.requestedStart,
      requestedEnd: entity.requestedEnd,
      notes: entity.notes ?? undefined,
      rating: entity.rating ?? undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    } as Partial<IBooking>;
  }
}
