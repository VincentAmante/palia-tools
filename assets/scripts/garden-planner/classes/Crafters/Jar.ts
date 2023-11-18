import { CropItem, ItemType } from '../items/Item'

import crops from '../../crop-list'
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
    if (this.hopperSlots.length === 0)
      return
    const item = this.hopperSlots[0]
    const crop = crops[item.cropType]
    if (crop === undefined || crop === null)
      throw new Error('Crop not found')

    const { preserveProcessMinutes } = crop.conversionInfo

    const MIN_SLOTS_NEEDED = 1
    // Handler for when there is not enough space in the output slots
    if (this.hopperSlots.length > MIN_SLOTS_NEEDED && this.settings.useHopperLimit) {
      // Needs space for at least one seed
      let hasSpaceForPreserve = false
      const matchingSlots = this.hopperSlots.filter(hopperItem => hopperItem.equals(item))
      if (matchingSlots.length > 0) {
        matchingSlots.forEach((hopperItem) => {
          const addable = (this.settings.useStackLimit ? hopperItem.maxStack - hopperItem.count : item.count)
          if (addable > 0)
            hasSpaceForPreserve = true
        })
      }

      if (!hasSpaceForPreserve)
        return
    }

    // This is just incase a change comes where 1 crop != 1 preserve
    const cropsCount = item.count
    const cropsNotConverted = cropsCount % 1
    const processes = cropsCount - cropsNotConverted

    const preservesProduced = processes
    const processTime = processes * preserveProcessMinutes
    const jarsItem = new CropItem(
      item.name,
      ItemType.Crop,
      crop.seedImage,
      (item.isStar ? crop.goldValues.seedStar : crop.goldValues.seed),
      item.isStar,
      30,
      preservesProduced,
      crop.type,
    )

    this.goldGenerated += jarsItem.price * jarsItem.count

    if (jarsItem.count > 0)
      this.insertToOutput(jarsItem)

    item.count -= cropsCount
    if (item.count === 0)
      this.hopperSlots.pop()
    else if (item.count < 0)
      throw new Error('Item count is less than 0')

    this.elapsedTimeMinutes += processTime
    this.lifeTimeMinutes += processTime
  }

  insertToOutput(item: CropItem): boolean {
    if (this.outputSlots.length >= this.maxOutputSlots && this.settings.useStackLimit) {
      const matchingItems = this.outputSlots
        .filter(outputItem => outputItem.equals(item))

      if (matchingItems.length > 0) {
        matchingItems.forEach((outputItem) => {
          const addable = (this.settings.useStackLimit ? outputItem.maxStack - outputItem.count : item.count)
          if (addable > 0) {
            const itemCount = item.count
            outputItem.add(Math.min(addable, itemCount))
            item.count -= Math.min(addable, itemCount)
          }
        })
      }
      return item.count === 0
    }

    else if (this.outputSlots.length < this.maxOutputSlots) {
      if (this.outputSlots.length > 0) {
        const matchingItems = this.outputSlots
          .filter(outputItem => outputItem.equals(item))

        if (matchingItems.length > 0) {
          matchingItems.forEach((outputItem) => {
            const addable = (this.settings.useStackLimit ? outputItem.maxStack - outputItem.count : item.count)
            if (addable > 0) {
              const itemCount = item.count
              outputItem.add(Math.min(addable, itemCount))
              item.count -= Math.min(addable, itemCount)
            }
          })

          return item.count === 0
        }
        else {
          this.outputSlots.push(item)
          return true
        }
      }
      else {
        this.outputSlots.push(item)
        return true
      }
    }

    return false
  }

  // Returns true if the item was fully inserted
  insertItem(itemData: InsertItemArgs & { item: CropItem }): boolean {
    const { day, item } = itemData

    // Accepts only crops for seeding
    if (!this.acceptedItems.includes(item.type))
      return false

    const minutes = day * 60

    // Update the lifetime of the seeder to include idle time
    if (this.lifeTimeMinutes === 0)
      this.lifeTimeMinutes = minutes
    else if (this.lifeTimeMinutes < minutes)
      this.lifeTimeMinutes = minutes

    if (this.hopperSlots.length >= this.maxHopperSlots && this.settings.useHopperLimit) {
      const matchingItems = this.hopperSlots
        .filter(hopperItem => hopperItem.equals(item))

      if (matchingItems.length > 0) {
        matchingItems.forEach((hopperItem) => {
          const addable = (this.settings.useStackLimit ? hopperItem.maxStack - hopperItem.count : item.count)
          if (addable > 0) {
            const itemCount = item.count
            hopperItem.add(Math.min(addable, itemCount))
            item.count -= Math.min(addable, itemCount)
          }
        })
      }
      return item.count === 0
    }

    else if (this.hopperSlots.length < this.maxHopperSlots || !this.settings.useHopperLimit) {
      if (this.hopperSlots.length > 0) {
        const matchingItems = this.hopperSlots
          .filter(hopperItem => hopperItem.equals(item))

        if (matchingItems.length > 0) {
          matchingItems.forEach((hopperItem) => {
            const addable = (this.settings.useStackLimit ? hopperItem.maxStack - hopperItem.count : item.count)
            if (addable > 0) {
              const itemCount = item.count
              hopperItem.add(Math.min(addable, itemCount))
              item.count -= Math.min(addable, itemCount)
            }
          })

          return item.count === 0
        }
        else {
          this.hopperSlots.push(item)
          return true
        }
      }
      else {
        this.hopperSlots.push(item)
        return true
      }
    }

    return false
  }

  setSettings(settings: Partial<Jar['settings']>): void {
    if (settings.useStackLimit !== undefined)
      this.settings.useStackLimit = settings.useStackLimit
    if (settings.useHopperLimit !== undefined)
      this.settings.useHopperLimit = settings.useHopperLimit
  }
}
