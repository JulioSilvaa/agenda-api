import { IAvailability } from '../interfaces/Availability';

export class AvailabilityEntity {
  private readonly _id?: string;
  private readonly _tenantId: string;
  private readonly _weekday: number;
  private readonly _startTime: string;
  private readonly _endTime: string;
  private readonly _isActive: boolean;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(props: IAvailability) {
    this._id = props.id;
    this._tenantId = props.tenantId;
    this._weekday = props.weekday;
    this._startTime = props.startTime;
    this._endTime = props.endTime;
    this._isActive = props.isActive ?? true;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();

    this.validate();
  }

  static create(props: IAvailability): AvailabilityEntity {
    return new AvailabilityEntity(props);
  }

  private validate(): void {
    this.validateWeekday();
    this.validateTimeFormat();
    this.validateTimeRange();
    this.validateTenantId();
    this.validateDates();
  }

  private validateWeekday(): void {
    if (this._weekday < 0 || this._weekday > 6) {
      throw new Error('Dia da semana inválido');
    }
  }

  private validateTimeFormat(): void {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

    if (!timeRegex.test(this._startTime)) {
      throw new Error('Horário de início inválido. Use formato HH:MM');
    }

    if (!timeRegex.test(this._endTime)) {
      throw new Error('Horário de término inválido. Use formato HH:MM');
    }
  }

  private validateTimeRange(): void {
    const [startHour, startMinute] = this._startTime.split(':').map(Number);
    const [endHour, endMinute] = this._endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (endMinutes <= startMinutes) {
      throw new Error('Horário de término deve ser posterior ao horário de início');
    }
  }

  private validateTenantId(): void {
    if (!this._tenantId || this._tenantId.trim().length === 0) {
      throw new Error('TenantId é obrigatório');
    }
  }

  private validateDates(): void {
    if (this._updatedAt < this._createdAt) {
      throw new Error('Data de atualização não pode ser anterior à data de criação');
    }
  }

  get id(): string | undefined {
    return this._id;
  }

  get tenantId(): string {
    return this._tenantId;
  }

  get weekday(): number {
    return this._weekday;
  }

  get startTime(): string {
    return this._startTime;
  }

  get endTime(): string {
    return this._endTime;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
