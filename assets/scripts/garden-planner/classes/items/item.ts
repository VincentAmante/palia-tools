import type CropType from '../../enums/crops'
import { getCropFromType } from '../../imports'
import { ItemType, parseCropId } from '../../utils/garden-helpers'
import type { ICropYield, ICropInfo, ICropName, ICropNameWithGrowthDiff } from '../../utils/garden-helpers'

export interface Item {
  readonly name: string
  readonly type: ItemType
  readonly image: string
  readonly price: number
  readonly isStar: boolean
  readonly maxStack: number
  count: number
  readonly itemId: string // Unique identifier (e.g., Tomato-Crop-Star)

  equals(item: Item): boolean
  add(count: number): void
  subtract(count: number): void

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
  readonly itemId: string
  protected _count: number

  constructor(name: string, type: ItemType.Crop | ItemType.Seed | ItemType.Preserve, image: string, price: number, isStar: boolean, maxStack: number, count: number, cropType: CropType) {
    this.name = name
    // Type assertion already handled by the parameter type
    // if (type !== ItemType.Crop && type !== ItemType.Seed && type !== ItemType.Preserve)
    //   throw new Error('Invalid item type')

    this.type = type
    this.image = image
    this.price = price
    this.isStar = isStar
    this.maxStack = maxStack
    this._count = count
    this.cropType = cropType
    this.itemId = `${this.cropType}-${this.type}-${this.isStar ? 'Star' : 'Base'}`
  }

  // Items are equal if they have the same unique ID
  equals(item: Item): boolean {
    return this.itemId === item.itemId
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

  subtract(count: number): void {
    this._count -= count
  }

  // Converts the count of this item into an array of stacks of this item based on the maxStack value.
  get inventoryStacks(): this[] {
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

  get tooltip(): string {
    return `${this.count * this.baseGoldValue} Gold`
  }

  get imgSrc(): string {
    return this.image
  }

  get imgAlt(): string {
    return this.name
  }

  get star(): boolean {
    return this.isStar
  }

  get baseGoldValue(): number {
    return this.price
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

  static fromCropYieldAndInfo(cropId: ICropNameWithGrowthDiff, cropYieldInfo: ICropYield & ICropInfo): CropItem {
    const parsedCropId = parseCropId(cropId)
    const cropName = cropId

    const crop = getCropFromType(parsedCropId.type)
    if (!crop)
      throw new Error(`No crop found: ${cropId}`)

    const image = crop.image
    const isStar = parsedCropId.isStar

    const price = crop.goldValues[isStar ? 'cropStar' : 'crop']

    const maxStack = 30
    const count = cropYieldInfo.totalWithDeductions

    return new CropItem(cropName, ItemType.Crop, image, price, isStar, maxStack, count, parsedCropId.type)
  }
}
