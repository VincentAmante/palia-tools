import type CropType from '../../enums/crops'

import { ItemType } from '../../utils/garden-helpers'

export interface Item {
  readonly name: string
  readonly type: ItemType
  readonly image: string
  readonly price: number
  readonly isStar: boolean
  readonly maxStack: number
  count: number

  equals(item: Item): boolean
  add(count: number): void

  /**
   * Returns an array of duplicate items that represent how many stacks of this item are in the inventory.
   */
  get inventoryStacks(): this[]
  // takes any number of identical items and combines them into stacks of this item
  combineIntoStacks(...items: Item[]): this[]
  combineToOneStack(...items: Item[]): this
}

/**
 * Crops Items are any class of items that correspond to a crop in the game (crop, seed, jarred preserve)
 *  This doesn't include fabric, which could be counted as a preserve but currently has its own ItemType
 */
export class CropItem implements Item {
  readonly name: string
  readonly type: ItemType.Crop | ItemType.Seed | ItemType.Preserve
  readonly image: string
  readonly price: number
  readonly isStar: boolean
  readonly maxStack: number
  readonly cropType: CropType
  protected _count: number

  constructor(name: string, type: ItemType, image: string, price: number, isStar: boolean, maxStack: number, count: number, cropType: CropType) {
    this.name = name
    if (type !== ItemType.Crop && type !== ItemType.Seed && type !== ItemType.Preserve)
      throw new Error('Invalid item type')

    this.type = type
    this.image = image
    this.price = price
    this.isStar = isStar
    this.maxStack = maxStack
    this._count = count
    this.cropType = cropType
  }

  // for crops, equals mean the same crop type and star quality
  equals(item: Item): boolean {
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
    // throw new Error('Method not implemented.')

    const stacks = []
    let count = this.count
    while (count > 0) {
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
      stacks.push(stack)
    }

    return stacks as this[]
  }

  // takes any number of identical items and combines them into stacks of this item
  combineIntoStacks(...items: this[]): this[] {
    items.forEach((item) => {
      if (!this.equals(item))
        throw new Error('Cannot combine different items')

      this.add(item.count)
    },
    )

    return this.inventoryStacks
  }

  combineToOneStack(...items: this[]): this {
    items.forEach((item) => {
      if (!this.equals(item))
        throw new Error('Cannot combine different items')

      this.add(item.count)
    },
    )

    return this
  }
}
