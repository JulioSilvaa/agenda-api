import { IService } from '../interfaces/Service';

export class ServiceEntity {
  private readonly _id?: string;
  private readonly _tenantId: string;
  private readonly _name: string;
  private readonly _description?: string | null;
  private readonly _price: number;
  private readonly _durationMinutes: number;
  private readonly _isActive: boolean;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(private props: IService) {
    this._id = props.id;
    this._tenantId = props.tenantId;
    this._name = props.name;
    this._description = props.description ?? null;
    this._price = props.price;
    this._durationMinutes = props.durationMinutes;
    this._isActive = props.isActive ?? true;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();

    this.validate();
  }

  static create(props: IService): ServiceEntity {
    return new ServiceEntity(props);
  }

  private validate(): void {
    this.validateName();
    this.validatePrice();
    this.validateDuration();
    this.validateTenantId();
    this.validateDescription();
    this.validateDates();
  }

  private validateName(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new Error('Nome é obrigatório');
    }

    if (this._name.trim().length < 3) {
      throw new Error('Nome deve ter pelo menos 3 caracteres');
    }

    if (this._name.length > 100) {
      throw new Error('Nome não pode ter mais de 100 caracteres');
    }
  }

  private validatePrice(): void {
    if (this._price < 0) {
      throw new Error('Preço não pode ser negativo');
    }

    if (this._price === 0) {
      throw new Error('Preço deve ser maior que zero');
    }
  }

  private validateDuration(): void {
    if (this._durationMinutes <= 0) {
      throw new Error('Duração deve ser maior que zero');
    }

    if (this._durationMinutes > 1440) {
      throw new Error('Duração não pode ser maior que 24 horas (1440 minutos)');
    }
  }

  private validateTenantId(): void {
    if (!this._tenantId || this._tenantId.trim().length === 0) {
      throw new Error('TenantId é obrigatório');
    }
  }

  private validateDescription(): void {
    if (!this._description) return;

    if (this._description.length > 500) {
      throw new Error('Descrição não pode ter mais de 500 caracteres');
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

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description ?? null;
  }

  get price(): number {
    return this._price;
  }

  get durationMinutes(): number {
    return this._durationMinutes;
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
