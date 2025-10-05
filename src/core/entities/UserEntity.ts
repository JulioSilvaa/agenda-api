import { IUser, UserRole } from "../interfaces/User";

export class UserEntity {
  private readonly _id?: string;
  private readonly _tenantId: string;
  private readonly _name: string;
  private readonly _email: string;
  private readonly _password: string;
  private readonly _role: UserRole;
  private readonly _isActive: boolean;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(private props: IUser) {
    this._id = props.id;
    this._tenantId = props.tenantId;
    this._name = props.name;
    this._email = props.email;
    this._password = props.password;
    this._role = props.role;
    this._isActive = props.isActive ?? true;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();

    this.validate();
  }

  static create(props: IUser): UserEntity {
    return new UserEntity(props);
  }

  private validate(): void {
    this.validateName();
    this.validateEmail();
    this.validatePassword();
    this.validateTenantId();
    this.validateRole();
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

  private validateEmail(): void {
    if (!this._email || this._email.trim().length === 0) {
      throw new Error("Email é obrigatório");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this._email)) {
      throw new Error("Email inválido");
    }
  }

  private validatePassword(): void {
    if (!this._password || this._password.trim().length === 0) {
      throw new Error("Senha é obrigatória");
    }

    if (this._password.length < 60) {
      throw new Error("Senha deve estar hasheada");
    }
  }

  private validateTenantId(): void {
    if (!this._tenantId || this._tenantId.trim().length === 0) {
      throw new Error("TenantId é obrigatório");
    }
  }

  private validateRole(): void {
    if (!Object.values(UserRole).includes(this._role)) {
      throw new Error("Role inválida");
    }
  }

  private validateDates(): void {
    if (this._updatedAt < this._createdAt) {
      throw new Error(
        "Data de atualização não pode ser anterior à data de criação"
      );
    }
  }

  isAdmin(): boolean {
    return this._role === UserRole.ADMIN;
  }

  isStaff(): boolean {
    return this._role === UserRole.STAFF;
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

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get role(): UserRole {
    return this._role;
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
