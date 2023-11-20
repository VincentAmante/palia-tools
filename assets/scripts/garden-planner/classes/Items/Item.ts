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
  get inventoryStacks(): this[]
  // takes any number of identical items and combines them into stacks of this item
  combineIntoStacks(...items: IItem[]): this[]
  combineToOneStack(...items: IItem[]): this
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
  get inventoryStacks(): this[] {
    let count = this.count
    const STACK_COUNT = Math.ceil(count / this.maxStack)

    if (STACK_COUNT === 1)
      return [this]

    return Array.from({ length: STACK_COUNT }, () => {
      const stack = new (this.constructor as any)(
        this.name,
        this.type,
        this.image,
        this.price,
        this.isStar,
        this.maxStack,
        Math.min(this.maxStack, count),
      )
      count -= stack.count

      return stack
    }) as this[]
  }

  // takes any number of identical items and combines them into stacks of this item
  combineIntoStacks(...items: this[]): this[] {
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

  combineToOneStack(...items: this[]): this {
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

  // Converts the count of this item into an array of stacks of this item based on the maxStack value.
  get inventoryStacks(): this[] {
    let count = this.count
    const STACK_COUNT = Math.ceil(count / this.maxStack)
    return Array.from({ length: STACK_COUNT }, () => {
      const stack = new CropItem(
        this.name,
        this.type,
        this.image,
        this.price,
        this.isStar,
        this.maxStack,
        Math.min(this.maxStack, count),
        this.cropType,
      )
      count -= stack.count

      return stack
    }) as this[]
  }
}
