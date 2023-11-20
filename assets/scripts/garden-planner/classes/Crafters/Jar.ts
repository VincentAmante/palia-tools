import { CropItem, ItemType } from '../items/Item'

import type { ICrafter, InsertItemArgs } from './ICrafter'

export class Jar implements ICrafter {
  name: string = 'Preserve Jar'
  type: ItemType.Preserve = ItemType.Preserve
  hopperSlots: CropItem[] = []
  maxHopperSlots: number = 1
  outputSlots: CropItem[] = []
  maxOutputSlots: number = 3
  acceptedItems: ItemType[] = [ItemType.Crop]
  lifeTimeMinutes: number = 0
  elapsedTimeMinutes: number = 0
  settings = {
    useStackLimit: true,
    useHopperLimit: true,
  }

  goldGenerated: number = 0

  process(): void {
    throw new Error('Method not implemented.')
  }

  // Returns true if the item was fully inserted
  // * By returning true, an early loop break can be achieved
  insertItem(itemData: InsertItemArgs & { item: CropItem }): boolean {
    // throw new Error('Method not implemented.')
    const item = itemData.item
    const matchingItems = this.getMatchingHopperSlots(item)

    if (matchingItems.length) {
      matchingItems.forEach((matchingItem) => {
        if (item.count === 0)
          return true
        if (item.count < 0)
          throw new Error('Item count is somehow less than 0')

        const addableAmount = matchingItem.maxStack - matchingItem.count
        const amountToAdd = (this.settings.useStackLimit) ? Math.min(item.count, addableAmount) : item.count
        matchingItem.count += amountToAdd
        item.count -= amountToAdd
      })
    }

    if (item.count === 0)
      return true

    if ((this.hopperSlots.length >= this.maxHopperSlots) && this.settings.useHopperLimit)
      return false

    while (item.count > 0 && this.hopperSlots.length < this.maxHopperSlots) {
      const amountToAdd = (this.settings.useStackLimit) ? Math.min(item.count, item.maxStack) : item.count

      // TODO: Add a clone method to CropItem
      const newItem = new CropItem(item.name, ItemType.Crop, item.image, item.price, item.isStar, item.maxStack, amountToAdd, item.cropType)
      this.hopperSlots.push(newItem)
      item.count -= amountToAdd
    }

    return item.count === 0
  }

  getMatchingHopperSlots(item: CropItem): CropItem[] {
    return this.hopperSlots.filter(hopperItem => item.equals(hopperItem))
  }

  setSettings(settings: Partial<Jar['settings']>): void {
    if (settings.useStackLimit !== undefined)
      this.settings.useStackLimit = settings.useStackLimit
    if (settings.useHopperLimit !== undefined)
      this.settings.useHopperLimit = settings.useHopperLimit
  }
}
