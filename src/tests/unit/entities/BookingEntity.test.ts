import { describe, expect, test } from 'vitest';
import { BookingEntity } from '../../../core/entities/BookingEntity';
import { BookingStatus } from '../../../core/interfaces/Booking';

describe('Unit test BookingEntity', () => {
  const now = new Date();
  const futureStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const futureEnd = new Date(futureStart.getTime() + 60 * 60 * 1000);

  const validBookingData = {
    id: '123',
    tenantId: 'tenant-123',
    customerId: 'customer-123',
    serviceId: 'service-123',
    staffUserId: 'staff-123',
    status: BookingStatus.PENDING,
    requestedStart: futureStart,
    requestedEnd: futureEnd,
    notes: 'Cliente solicitou corte especial',
    rating: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('Entity Creation', () => {
    test('should create booking with valid data', () => {
      const booking = BookingEntity.create(validBookingData);

      expect(booking).toBeDefined();
      expect(booking.tenantId).toBe(validBookingData.tenantId);
      expect(booking.status).toBe(BookingStatus.PENDING);
      expect(booking.notes).toBe(validBookingData.notes);
    });

    test('should create booking with default status as PENDING', () => {
      const booking = BookingEntity.create({
        ...validBookingData,
        status: undefined as any,
      });

      expect(booking.status).toBe(BookingStatus.PENDING);
    });

    test('should create booking without optional fields', () => {
      const booking = BookingEntity.create({
        ...validBookingData,
        customerId: undefined,
        serviceId: undefined,
        staffUserId: undefined,
        notes: undefined,
      });

      expect(booking.customerId).toBeUndefined();
      expect(booking.serviceId).toBeUndefined();
      expect(booking.staffUserId).toBeUndefined();
      expect(booking.notes).toBeUndefined();
    });
  });

  describe('Status Validation', () => {
    test('should accept PENDING status', () => {
      const booking = BookingEntity.create({
        ...validBookingData,
        status: BookingStatus.PENDING,
      });

      expect(booking.status).toBe(BookingStatus.PENDING);
      expect(booking.isPending()).toBe(true);
    });

    test('should accept CONFIRMED status', () => {
      const booking = BookingEntity.create({
        ...validBookingData,
        status: BookingStatus.CONFIRMED,
      });

      expect(booking.status).toBe(BookingStatus.CONFIRMED);
      expect(booking.isConfirmed()).toBe(true);
    });

    test('should accept CANCELLED status', () => {
      const booking = BookingEntity.create({
        ...validBookingData,
        status: BookingStatus.CANCELLED,
      });

      expect(booking.status).toBe(BookingStatus.CANCELLED);
      expect(booking.isCancelled()).toBe(true);
    });

    test('should accept COMPLETED status', () => {
      const booking = BookingEntity.create({
        ...validBookingData,
        status: BookingStatus.COMPLETED,
      });

      expect(booking.status).toBe(BookingStatus.COMPLETED);
      expect(booking.isCompleted()).toBe(true);
    });

    test('should reject invalid status', () => {
      expect(() =>
        BookingEntity.create({
          ...validBookingData,
          status: 'INVALID' as any,
        })
      ).toThrow('Status inválido');
    });
  });

  describe('Time Range Validation', () => {
    test('should accept valid time range', () => {
      const booking = BookingEntity.create(validBookingData);
      expect(booking).toBeDefined();
    });

    test('should reject requestedEnd before requestedStart', () => {
      expect(() =>
        BookingEntity.create({
          ...validBookingData,
          requestedStart: futureEnd,
          requestedEnd: futureStart,
        })
      ).toThrow('Data de término deve ser posterior à data de início');
    });

    test('should reject requestedEnd equal to requestedStart', () => {
      expect(() =>
        BookingEntity.create({
          ...validBookingData,
          requestedStart: futureStart,
          requestedEnd: futureStart,
        })
      ).toThrow('Data de término deve ser posterior à data de início');
    });

    test('should reject requestedStart in the past', () => {
      // Garante uma data no passado (um dia atrás)
      const past = new Date();
      past.setDate(past.getDate() - 1);
      const pastEnd = new Date(past.getTime() + 60 * 60 * 1000);

      expect(() =>
        BookingEntity.create({
          ...validBookingData,
          requestedStart: past,
          requestedEnd: pastEnd,
        })
      ).toThrow('Data de início não pode ser no passado');
    });
  });

  describe('Rating Validation', () => {
    test('should accept null rating', () => {
      const booking = BookingEntity.create({
        ...validBookingData,
        rating: undefined,
      });

      expect(booking.rating).toBeUndefined();
    });

    test('should accept rating 1', () => {
      const booking = BookingEntity.create({
        ...validBookingData,
        rating: 1,
      });

      expect(booking.rating).toBe(1);
    });

    test('should accept rating 5', () => {
      const booking = BookingEntity.create({
        ...validBookingData,
        rating: 5,
      });

      expect(booking.rating).toBe(5);
    });

    test('should reject rating less than 1', () => {
      expect(() =>
        BookingEntity.create({
          ...validBookingData,
          rating: 0,
        })
      ).toThrow('Avaliação deve estar entre 1 e 5');
    });

    test('should reject rating greater than 5', () => {
      expect(() =>
        BookingEntity.create({
          ...validBookingData,
          rating: 6,
        })
      ).toThrow('Avaliação deve estar entre 1 e 5');
    });
  });

  describe('Notes Validation', () => {
    test('should accept valid notes', () => {
      const booking = BookingEntity.create(validBookingData);
      expect(booking.notes).toBe(validBookingData.notes);
    });

    test('should accept null notes', () => {
      const booking = BookingEntity.create({
        ...validBookingData,
        notes: undefined,
      });

      expect(booking.notes).toBeUndefined();
    });

    test('should reject notes with more than 1000 characters', () => {
      expect(() =>
        BookingEntity.create({
          ...validBookingData,
          notes: 'a'.repeat(1001),
        })
      ).toThrow('Notas não podem ter mais de 1000 caracteres');
    });
  });

  describe('Domain Methods', () => {
    test('canBeCancelled should return true for PENDING status', () => {
      const booking = BookingEntity.create({
        ...validBookingData,
        status: BookingStatus.PENDING,
      });

      expect(booking.canBeCancelled()).toBe(true);
    });

    test('canBeCancelled should return true for CONFIRMED status', () => {
      const booking = BookingEntity.create({
        ...validBookingData,
        status: BookingStatus.CONFIRMED,
      });

      expect(booking.canBeCancelled()).toBe(true);
    });

    test('canBeCancelled should return false for CANCELLED status', () => {
      const booking = BookingEntity.create({
        ...validBookingData,
        status: BookingStatus.CANCELLED,
      });

      expect(booking.canBeCancelled()).toBe(false);
    });

    test('canBeCancelled should return false for COMPLETED status', () => {
      const booking = BookingEntity.create({
        ...validBookingData,
        status: BookingStatus.COMPLETED,
      });

      expect(booking.canBeCancelled()).toBe(false);
    });

    test('canBeRated should return true for COMPLETED without rating', () => {
      const booking = BookingEntity.create({
        ...validBookingData,
        status: BookingStatus.COMPLETED,
        rating: undefined,
      });

      expect(booking.canBeRated()).toBe(true);
    });

    test('canBeRated should return false for COMPLETED with rating', () => {
      const booking = BookingEntity.create({
        ...validBookingData,
        status: BookingStatus.COMPLETED,
        rating: 5,
      });

      expect(booking.canBeRated()).toBe(false);
    });

    test('canBeRated should return false for PENDING status', () => {
      const booking = BookingEntity.create({
        ...validBookingData,
        status: BookingStatus.PENDING,
      });

      expect(booking.canBeRated()).toBe(false);
    });
  });

  describe('TenantId Validation', () => {
    test('should reject empty tenantId', () => {
      expect(() =>
        BookingEntity.create({
          ...validBookingData,
          tenantId: '',
        })
      ).toThrow('TenantId é obrigatório');
    });
  });

  describe('Getters', () => {
    test('should return all properties correctly', () => {
      const booking = BookingEntity.create(validBookingData);

      expect(booking.id).toBe(validBookingData.id);
      expect(booking.tenantId).toBe(validBookingData.tenantId);
      expect(booking.customerId).toBe(validBookingData.customerId);
      expect(booking.serviceId).toBe(validBookingData.serviceId);
      expect(booking.staffUserId).toBe(validBookingData.staffUserId);
      expect(booking.status).toBe(validBookingData.status);
      expect(booking.notes).toBe(validBookingData.notes);
    });
  });
});
