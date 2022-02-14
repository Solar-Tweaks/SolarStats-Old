import { Slot } from '../Types';

export default class Item {
  public slotRepresentation: Slot;

  private _id: number;
  private _amount: number;
  private _meta: number;
  private _displayName: string;
  private _lore: string[];

  public constructor(id: number, amount?: number) {
    this._id = id;
    this._amount = amount || 1;
    this.lore = [];

    this.slotRepresentation = {
      blockId: this._id,
      itemCount: this._amount,
    };
  }

  public set id(value: number) {
    this._id = value;
    this.slotRepresentation.blockId = value;
  }

  public get id(): number {
    return this._id;
  }

  public set amount(value: number) {
    this._amount = value;
    this.slotRepresentation.itemCount = value;
  }

  public get amount(): number {
    return this._amount;
  }

  public set meta(value: number) {
    this._meta = value;
    this.slotRepresentation.itemDamage = value;
  }

  public get meta(): number {
    return this._meta;
  }

  public set displayName(value: string) {
    this._displayName = value;

    if (
      !Object.prototype.hasOwnProperty.call(this.slotRepresentation, 'nbtData')
    )
      this.setupNbtData();

    this.slotRepresentation.nbtData.value.display.value.Name = {
      type: 'string',
      value,
    };
  }

  public get displayName(): string {
    return this._displayName;
  }

  public set lore(value: string[]) {
    if (value.length <= 0) return;

    this._lore = value;
    if (
      !Object.prototype.hasOwnProperty.call(this.slotRepresentation, 'nbtData')
    )
      this.setupNbtData();

    this.slotRepresentation.nbtData.value.display.value.Lore = {
      type: 'list',
      value: {
        type: 'string',
        value,
      },
    };
  }

  public get lore(): string[] {
    return this._lore;
  }

  private setupNbtData() {
    this.slotRepresentation.nbtData = {
      type: 'compound',
      name: '',
      value: {
        display: {
          type: 'compound',
          value: {},
        },
      },
    };
  }

  public static emptyItem: Slot = {
    blockId: -1,
    itemCount: undefined,
    itemDamage: undefined,
    nbtData: undefined,
  };
}
