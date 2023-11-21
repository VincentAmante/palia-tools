import type { CropItem, CropLogItem, IItem } from '../Items/Item'
import crops from '../../crop-list'
import { ItemType } from '../Items/Item'

import type { ICrafter, InsertItemArgs } from './ICrafter'

// The number of minutes in an in-game day
const DAY_IN_MINUTES = 60

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

  logs: {
    insertions: Record<number, CropLogItem[]>
    collections: Record<number, CropLogItem[]>
  } = {
      insertions: {},
      collections: {},
    }

  goldGenerated: number = 0

  process(): void {
    // throw new Error('Method not implemented.')

    for (const hopperItem of this.hopperSlots) {
      const crop = crops[hopperItem.cropType]
    }
  }

  initialiseLogInsertion(day: number) {
    if (!this.logs.insertions[day])
      this.logs.insertions[day] = []
  }

  initialiseLogCollection(day: number) {
    if (!this.logs.collections[day])
      this.logs.collections[day] = []
  }

  // Returns true if the item was fully inserted
  // * By returning true, an early loop break can be achieved
  insertItem(itemData: InsertItemArgs & { item: CropItem }): boolean {
    // throw new Error('Method not implemented.')
    const item = itemData.item
    const matchingItems = this.getMatchingHopperSlots(item)

    const dayInMinutes = itemData.day * DAY_IN_MINUTES

    // If there are matching items, add to them first
    if (matchingItems.length) {
      matchingItems.forEach((matchingItem) => {
        if (item.count === 0)
          return true
        if (item.count < 0)
          throw new Error('Item count is somehow less than 0')

        const addableAmount = matchingItem.maxStack - matchingItem.count
        const amountToAdd = (this.settings.useStackLimit) ? Math.min(item.count, addableAmount) : item.count
        const newItem = item.take(amountToAdd) as CropItem
        matchingItem.count += newItem.count

        if (amountToAdd > 0) {
          // * This is so lifetime can also include the amount of time the crafter has been idle
          this.lifeTimeMinutes = Math.max(this.lifeTimeMinutes, dayInMinutes)
          this.initialiseLogInsertion(itemData.day)
          this.logs.insertions[itemData.day].push(newItem.logItem())
        }
      })
    }

    if (item.count === 0)
      return true
    if ((this.hopperSlots.length >= this.maxHopperSlots) && this.settings.useHopperLimit)
      return false

    // If there are still items left, try adding them to empty slots
    while (item.count > 0 && this.hopperSlots.length < this.maxHopperSlots) {
      const amountToAdd = (this.settings.useStackLimit) ? Math.min(item.count, item.maxStack) : item.count

      // const newItem = new CropItem(item.name, ItemType.Crop, item.image, item.price, item.isStar, item.maxStack, amountToAdd, item.cropType)
      const newItem = item.take(amountToAdd) as CropItem
      this.hopperSlots.push(newItem)

      if (amountToAdd > 0) {
        // * This is so lifetime can also include the amount of time the crafter has been idle
        this.lifeTimeMinutes = Math.max(this.lifeTimeMinutes, dayInMinutes)

        this.initialiseLogInsertion(itemData.day)
        this.logs.insertions[itemData.day].push(item.logItem(amountToAdd) as CropLogItem)
      }
    }

    return item.count === 0
  }

  getMatchingHopperSlots(item: CropItem): CropItem[] {
    return this.hopperSlots.filter(hopperItem => item.equals(hopperItem))
  }

  collect(day: number = 0): IItem[] {
    for (const outputItem of this.outputSlots) {
      this.initialiseLogCollection(day)
      this.logs.collections[day].push(outputItem.logItem(outputItem.count) as CropLogItem)
    }

    return this.outputSlots.splice(0, this.outputSlots.length)
  }

  setSettings(settings: Partial<Jar['settings']>): void {
    if (settings.useStackLimit !== undefined)
      this.settings.useStackLimit = settings.useStackLimit
    if (settings.useHopperLimit !== undefined)
      this.settings.useHopperLimit = settings.useHopperLimit
  }
}
