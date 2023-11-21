import type CropType from '../../enums/crops'

export enum ItemType {
  Crop = 'crop',
  Seed = 'seed',
  Preserve = 'preserve',
  Fertiliser = 'fertiliser',
  // Optional types
  Worm = 'worm',
  Fabric = 'fabric',
  Weed = 'weed',
  // For unimplemented items
  Misc = 'misc',
}

export interface LogItem {
  readonly name: string
  readonly type: ItemType
  readonly image: string
  readonly price: number
  readonly isStar: boolean
  readonly count: number
}

export interface IItem {
  readonly name: string
  readonly type: ItemType
  readonly image: string
  readonly price: number
  readonly isStar: boolean
  readonly maxStack: number
  count: number

  equals(item: IItem): boolean
  add(count: number): void

  /**
   * Returns an array of duplicate items that represent how many stacks of this item are in the inventory.
   */
  get inventoryStacks(): IItem[]
  // takes any number of identical items and combines them into stacks of this item
  combineIntoStacks(...items: IItem[]): IItem[]
  combineToOneStack(...items: IItem[]): IItem
  clone(count?: number): IItem
  take(count: number): IItem
  splitInto(stacks: number): IItem[]
  logItem(count: number): LogItem | CropLogItem
}

export abstract class Item implements IItem {
  readonly name: string
  readonly type: ItemType
  readonly image: string
  readonly price: number
  readonly isStar: boolean
  readonly maxStack: number
  protected _count: number

  constructor(name: string, type: ItemType, image: string, price: number, isStar: boolean, maxStack: number, count: number) {
    this.name = name
    this.type = type
    this.image = image
    this.price = price
    this.isStar = isStar
    this.maxStack = maxStack
    this._count = count
  }

  abstract equals(item: IItem): boolean
  abstract add(count: number): void

  get count(): number {
    return this._count
  }

  set count(count: number) {
    this._count = count
  }

  // Converts the count of this item into an array of stacks of this item based on the maxStack value.
  get inventoryStacks(): IItem[] {
    const count = this.count
    const STACK_COUNT = Math.ceil(count / this.maxStack)

    if (STACK_COUNT === 1)
      return [this]

    return Array.from({ length: STACK_COUNT }, () => {
      const stack = this.take(Math.min(this.maxStack, count))
      return stack
    })
  }

  // takes any number of identical items and combines them into stacks of this item
  combineIntoStacks(...items: IItem[]) {
    try {
      items.forEach((item) => {
        if (!this.equals(item))
          throw new Error('Cannot combine different items')

        this.add(item.count)
      })
      return this.inventoryStacks
    }
    catch (error) {
      console.error(`Error combining items: ${error}`)
      return []
    }
  }

  combineToOneStack(...items: IItem[]) {
    try {
      items.forEach((item) => {
        if (!this.equals(item))
          throw new Error('Cannot combine different items')

        this.add(item.count)
      })
      return this
    }
    catch (error) {
      console.error(`Error combining items: ${error}`)
      return this
    }
  }

  // Makes a copy of this item with the specified count
  // * If count is not specified, the count is 0 as this will be considered a new item
  clone(count = 0) {
    return new (this.constructor as any)(
      this.name,
      this.type,
      this.image,
      this.price,
      this.isStar,
      this.maxStack,
      count,
    )
  }

  // Takes the specified number of items from this item and returns a new item with that count
  take(count: number): CropItem {
    if (count > this.count)
      throw new Error('Cannot take more items than the current count')

    const toTake = Math.min(count, this.count)
    const clone = this.clone(toTake)
    this.count -= toTake
    return clone
  }

  // Splits the item into the specified number of stacks
  splitInto(stacks: number) {
    if (stacks <= 1)
      return [this]
    if (stacks > this.count)
      throw new Error('Cannot split into more stacks than the current count')
    const amountToTake = Math.round(this.count / stacks)
    return Array.from({ length: stacks }, () => this.take(amountToTake))
  }

  // Returns an object meant for logging the item in transactions
  logItem(count: number = this._count) {
    const item: LogItem = {
      name: this.name,
      type: this.type,
      image: this.image,
      price: this.price,
      isStar: this.isStar,
      count,
    }
    return item
  }
}

export interface CropLogItem extends LogItem {
  readonly type: ItemType.Crop
  readonly cropType: CropType
}

/**
 * Crops Items are any class of items that correspond to a crop in the game (crop, seed, jarred preserve)
 *  This doesn't include fabric, which could be counted as a preserve but currently has its own ItemType
 */
export class CropItem extends Item {
  readonly type: ItemType.Crop | ItemType.Seed | ItemType.Preserve
  readonly cropType: CropType

  constructor(name: string, type: ItemType, image: string, price: number, isStar: boolean, maxStack: number, count: number, cropType: CropType) {
    super(name, type, image, price, isStar, maxStack, count)
    if (type !== ItemType.Crop && type !== ItemType.Seed && type !== ItemType.Preserve)
      throw new Error('Invalid item type')
    this.type = type
    this.cropType = cropType
  }

  // for crops, equals mean the same crop type and star quality
  equals(item: IItem): boolean {
    return this.name === item.name && this.isStar === item.isStar
  }

  get count(): number {
    return this._count
  }

  set count(count: number) {
    this._count = count
  }

  add(count: number): void {
    this._count += count
  }

  clone(count = 0) {
    // console.debug(`Cloning ${this.name} with count ${count}`)
    return new CropItem(
      this.name,
      this.type,
      this.image,
      this.price,
      this.isStar,
      this.maxStack,
      count,
      this.cropType,
    )
  }

  logItem(count: number = this._count): CropLogItem {
    const item: CropLogItem = {
      name: this.name,
      type: ItemType.Crop,
      image: this.image,
      price: this.price,
      isStar: this.isStar,
      count,
      cropType: this.cropType,
    }
    return item
  }
}
