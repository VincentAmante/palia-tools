// TODO: Segment into separate files

import type CropType from '../../enums/cropType'
import ItemType from '../../enums/itemType'

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
  readonly id: string
  count: number

  equals(item: IItem): boolean
  add(count: number): void

  // converts the item into stacks of the maximum stack size, like how they behave in the player's inventory
  get inventoryStacks(): IItem[]
  // takes any number of identical items and combines them into stacks of this item
  combineIntoStacks(...items: IItem[]): IItem[]
  // takes any number of identical items and combines them into one stack of this item
  combineToOneStack(...items: IItem[]): IItem
  clone(count?: number): IItem
  take(count: number): IItem
  splitInto(stacks: number): IItem[]
  logItem(count: number): LogItem | CropLogItem
}

/**
 * Represents an abstract item in the game.
 */
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

  get id(): string {
    return `${this.name}-${this.isStar ? 'star' : 'base'}`
  }

  /**
   * Converts the item into stacks of the maximum stack size, like how they behave in the player's inventory.
   * This subtracts the count of the stacks from the original item.
   * @returns An array of IItem representing the inventory stacks.
   */
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

  /**
   * Combines multiple items of the same type into one set of stacks.
   * Useful for combining items with different counts into one set of stacks.
   * @param items - The items to be combined. Must be of the same type.
   * @returns An array of inventory stacks after combining the items.
   * @throws Error if the items being combined are different.
   */
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

  /**
   * Combines multiple items of the same type into one stack.
   * Useful for combining items with different counts into one stack.
   * @param items - The items to be combined. Must be of the same type.
   * @returns The combined stack.
   * @throws Error if the items being combined are different.
   */
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

  /**
   * Creates a clone of the item.
   * @param count The count of the cloned item. Defaults to 0 as this will be considered a new item.
   * @returns A new instance of the cloned item.
   */
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

  /**
   * Takes the specified amount of items from the current item and returns a new item with the specified count.
   * @param count The amount of items to take.
   * @returns A new item with the specified count.
   * @throws Error if the count is greater than the current count.
   */
  take(count: number): CropItem {
    const toTake = Math.min(count, this.count)
    const clone = this.clone(toTake)
    this.count -= toTake

    return clone
  }

  /**
   * Splits the item as evenly as possible into the specified number of stacks.
   * @param stacks The number of stacks to split the item into.
   * @returns An array of items representing the stacks.
   * @throws Error if the number of stacks is less than or equal to 1 or greater than the current count.
   */
  splitInto(stacks: number) {
    if (stacks <= 1)
      return [this]
    if (stacks > this.count)
      throw new Error('Cannot split into more stacks than the current count')
    const amountToTake = Math.round(this.count / stacks)
    return Array.from({ length: stacks }, () => this.take(amountToTake))
  }

  /**
   * Logs the item for info-purposes and returns a LogItem.
   * @param count - The count of the item. Defaults to the current count of the item.
   * @returns The LogItem representing the logged item.
   */
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
    if (!(item instanceof CropItem))
      return false

    return this.name === item.name && this.type === item.type && this.isStar === item.isStar
  }

  get id(): string {
    return `${this.name}-${this.cropType}-${this.isStar ? 'star' : 'base'}`
  }

  add(count: number): void {
    this._count += count
  }

  /**
   * Creates a clone of the crop item, unlike the base Item class, this will also clone the cropType.
   * @param count The count of the cloned item. Defaults to 0 as this will be considered a new item.
   * @returns A new instance of the cloned item.
   */
  clone(count = 0) {
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

  cloneAltQuality(count = 0, isStar: boolean = !this.isStar) {
    return new CropItem(
      this.name,
      this.type,
      this.image,
      this.price,
      isStar,
      this.maxStack,
      count,
      this.cropType,
    )
  }

  /**
   * Logs the item for info-purposes and returns a CropLogItem.
   * @param count - The count of the item. Defaults to the current count of the item.
   * @returns The CropLogItem representing the logged item.
   */
  logItem(count: number = this._count): CropLogItem {
    return {
      name: this.name,
      type: ItemType.Crop,
      image: this.image,
      price: this.price,
      isStar: this.isStar,
      count,
      cropType: this.cropType,
    } as const
  }
}
