import { IBlockedSlot } from "../interfaces/BlockedSlot";

export class BlockedSlotEntity {
  private readonly _id?: string;
  private readonly _tenantId: string;
  private readonly _staffUserId?: string | null;
  private readonly _startTime: Date;
  private readonly _endTime: Date;
  private readonly _reason?: string | null;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(private props: IBlockedSlot) {
    this._id = props.id;
    this._tenantId = props.tenantId;
    this._staffUserId = props.staffUserId ?? null;
    this._startTime = props.startTime;
    this._endTime = props.endTime;
    this._reason = props.reason ?? null;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();

    this.validate();
  }

  static create(props: IBlockedSlot): BlockedSlotEntity {
    return new BlockedSlotEntity(props);
  }

  private validate(): void {
    this.validateTenantId();
    this.validateTimeRange();
    this.validateReason();
    this.validateDates();
  }

  private validateTenantId(): void {
    if (!this._tenantId || this._tenantId.trim().length === 0) {
      throw new Error("TenantId é obrigatório");
    }
  }

  private validateTimeRange(): void {
    if (this._endTime <= this._startTime) {
      throw new Error(
        "Horário de término deve ser posterior ao horário de início"
      );
    }
  }

  private validateReason(): void {
    if (!this._reason) return;

    if (this._reason.length > 500) {
      throw new Error("Motivo não pode ter mais de 500 caracteres");
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

  get staffUserId(): string | null {
    return this._staffUserId ?? null;
  }

  get startTime(): Date {
    return this._startTime;
  }

  get endTime(): Date {
    return this._endTime;
  }

  get reason(): string | null {
    return this._reason ?? null;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
