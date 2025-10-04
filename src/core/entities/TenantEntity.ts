import { ITenant } from "../interfaces/Tenant";

export class TenantEntity {
  private readonly _id?: string | null;
  private readonly _name: string;
  private readonly _slug: string;
  private readonly _isActive: boolean;
  private readonly _email: string;
  private readonly _phone?: string | null;
  private readonly _address?: string | null;

  constructor(private props: ITenant) {
    this._id = props.id ?? null;
    this._name = props.name;
    this._slug = props.slug;
    this._email = props.email;
    this._isActive = props.isActive;
    this._phone = props.phone;
    this._address = props.address;

    this.validate();
  }

  static create(props: ITenant): TenantEntity {
    return new TenantEntity(props);
  }

  private validate(): void {
    if (!this._name || this._name.trim().length < 3) {
      throw new Error("Nome do tenant deve ter pelo menos 3 caracteres");
    }

    if (!this._email || !this.validateEmail(this._email)) {
      throw new Error("Email inválido");
    }

    if (!this._slug || !this.validateSlug(this._slug)) {
      throw new Error(
        "Slug inválido. Use apenas letras minúsculas, números e hífens"
      );
    }

    if (this._phone && !this.validatePhone(this._phone)) {
      throw new Error("Telefone inválido");
    }
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validateSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
  }

  private validatePhone(phone: string): boolean {
    const numeroLimpo = phone.replace(/\D/g, "");
    const phoneRegex =
      /^(?:(?:\+|00)?(55)\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3})[-]?(\d{4}))$/;
    return (
      phoneRegex.test(phone) ||
      (numeroLimpo.length >= 8 &&
        numeroLimpo.length <= 11 &&
        phoneRegex.test(numeroLimpo))
    );
  }

  // Getters
  get id(): string | null {
    return this._id ?? null;
  }

  get name(): string | null {
    return this._name ?? null;
  }

  get slug(): string | null {
    return this._slug ?? null;
  }

  get email(): string | null {
    return this._email ?? null;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get phone(): string | null {
    return this._phone ?? null;
  }

  get address(): string | null {
    return this._address ?? null;
  }
}
