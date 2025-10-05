import { BookingStatus, IBooking } from '../interfaces/Booking';

export class BookingEntity {
  private readonly _id?: string;
  private readonly _tenantId: string;
  private readonly _customerId?: string | null;
  private readonly _serviceId?: string | null;
  private readonly _staffUserId?: string | null;
  private readonly _status: BookingStatus;
  private readonly _requestedStart: Date;
  private readonly _requestedEnd: Date;
  private readonly _notes?: string | null;
  private readonly _rating?: number | null;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(props: IBooking) {
    this._id = props.id;
    this._tenantId = props.tenantId;
    this._customerId = props.customerId ?? null;
    this._serviceId = props.serviceId ?? null;
    this._staffUserId = props.staffUserId ?? null;
    this._status = props.status ?? BookingStatus.PENDING;
    this._requestedStart = props.requestedStart;
    this._requestedEnd = props.requestedEnd;
    this._notes = props.notes ?? null;
    this._rating = props.rating ?? null;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();

    this.validate();
  }

  static create(props: IBooking): BookingEntity {
    return new BookingEntity(props);
  }

  private validate(): void {
    this.validateTenantId();
    this.validateStatus();
    this.validateDates();
    this.validateTimeRange();
    this.validateRating();
    this.validateNotes();
  }

  private validateTenantId(): void {
    if (!this._tenantId || this._tenantId.trim().length === 0) {
      throw new Error('TenantId é obrigatório');
    }
  }

  private validateStatus(): void {
    if (!Object.values(BookingStatus).includes(this._status)) {
      throw new Error('Status inválido');
    }
  }

  private validateDates(): void {
    if (this._updatedAt < this._createdAt) {
      throw new Error('Data de atualização não pode ser anterior à data de criação');
    }
  }

  private validateTimeRange(): void {
    if (this._requestedEnd <= this._requestedStart) {
      throw new Error('Data de término deve ser posterior à data de início');
    }

    if (this._requestedStart < new Date()) {
      throw new Error('Data de início não pode ser no passado');
    }
  }

  private validateRating(): void {
    if (this._rating === null || this._rating === undefined) return;

    if (this._rating < 1 || this._rating > 5) {
      throw new Error('Avaliação deve estar entre 1 e 5');
    }
  }

  private validateNotes(): void {
    if (!this._notes) return;

    if (this._notes.length > 1000) {
      throw new Error('Notas não podem ter mais de 1000 caracteres');
    }
  }

  isPending(): boolean {
    return this._status === BookingStatus.PENDING;
  }

  isConfirmed(): boolean {
    return this._status === BookingStatus.CONFIRMED;
  }

  isCancelled(): boolean {
    return this._status === BookingStatus.CANCELLED;
  }

  isCompleted(): boolean {
    return this._status === BookingStatus.COMPLETED;
  }

  canBeCancelled(): boolean {
    return this._status === BookingStatus.PENDING || this._status === BookingStatus.CONFIRMED;
  }

  canBeRated(): boolean {
    return this._status === BookingStatus.COMPLETED && this._rating === null;
  }

  get id(): string | undefined {
    return this._id;
  }

  get tenantId(): string {
    return this._tenantId;
  }

  get customerId(): string | undefined {
    return this._customerId ?? undefined;
  }

  get serviceId(): string | undefined {
    return this._serviceId ?? undefined;
  }

  get staffUserId(): string | undefined {
    return this._staffUserId ?? undefined;
  }

  get status(): BookingStatus {
    return this._status;
  }

  get requestedStart(): Date {
    return this._requestedStart;
  }

  get requestedEnd(): Date {
    return this._requestedEnd;
  }

  get notes(): string | undefined {
    return this._notes ?? undefined;
  }

  get rating(): number | undefined {
    return this._rating ?? undefined;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
