import { ICustomer } from "../interfaces/Customer";

export class CustomerEntity {
  private readonly _id?: string;
  private readonly _tenantId: string;
  private readonly _name: string;
  private readonly _email?: string | null;
  private readonly _phone: string;
  private readonly _isActive: boolean;
  private readonly _totalBookings: number;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(private props: ICustomer) {
    this._id = props.id;
    this._tenantId = props.tenantId;
    this._name = props.name;
    this._email = props.email ?? null;
    this._phone = props.phone;
    this._isActive = props.isActive ?? true;
    this._totalBookings = props.totalBookings ?? 0;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();

    this.validate();
  }

  static create(props: ICustomer): CustomerEntity {
    return new CustomerEntity(props);
  }

  private validate(): void {
    this.validateName();
    this.validatePhone();
    this.validateEmail();
    this.validateTenantId();
    this.validateTotalBookings();
    this.validateDates();
  }

  private validateName(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new Error("Nome é obrigatório");
    }

    if (this._name.trim().length < 3) {
      throw new Error("Nome deve ter pelo menos 3 caracteres");
    }

    if (this._name.length > 100) {
      throw new Error("Nome não pode ter mais de 100 caracteres");
    }
  }

  private validatePhone(): void {
    if (!this._phone || this._phone.trim().length === 0) {
      throw new Error("Telefone é obrigatório");
    }

    const numeroLimpo = this._phone.replace(/\D/g, "");

    if (numeroLimpo.length < 8 || numeroLimpo.length > 11) {
      throw new Error("Telefone inválido. Use formato brasileiro com DDD");
    }

    const phoneRegex =
      /^(?:(?:\+|00)?(55)\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3})[-]?(\d{4}))$/;

    if (!phoneRegex.test(this._phone) && !phoneRegex.test(numeroLimpo)) {
      throw new Error("Telefone inválido. Use formato brasileiro com DDD");
    }
  }

  private validateEmail(): void {
    if (this._email === null || this._email === undefined) return;

    if (this._email.trim().length === 0) {
      throw new Error('Email não pode ser vazio');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this._email)) {
      throw new Error("Email inválido");
    }
  }

  private validateTenantId(): void {
    if (!this._tenantId || this._tenantId.trim().length === 0) {
      throw new Error("TenantId é obrigatório");
    }
  }

  private validateTotalBookings(): void {
    if (this._totalBookings < 0) {
      throw new Error("Total de agendamentos não pode ser negativo");
    }
  }

  private validateDates(): void {
    if (this._updatedAt < this._createdAt) {
      throw new Error(
        "Data de atualização não pode ser anterior à data de criação"
      );
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

  get email(): string | null {
    return this._email ?? null;
  }

  get phone(): string {
    return this._phone;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get totalBookings(): number {
    return this._totalBookings;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
