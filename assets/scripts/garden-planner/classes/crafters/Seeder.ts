import { CropItem, ItemType } from '../items/item'

import crops from '../../crop-list'
import type { ICrafter, InsertItemArgs } from './ICrafter'

export class Seeder implements ICrafter {
  name: string = 'Seeder'
  type: ItemType.Seed = ItemType.Seed
  hopperSlots: CropItem[] = []
  maxHopperSlots: number = 1
  outputSlots: CropItem[] = []
  maxOutputSlots: number = 3
  acceptedItems: ItemType[] = [ItemType.Crop]
  lifeTimeMinutes: number = 0
  elapsedTimeMinutes: number = 0

  process(): void {
    if (this.hopperSlots.length === 0)
      return
    const item = this.hopperSlots[0]
    const crop = crops[item.cropType]
    if (crop === undefined || crop === null)
      throw new Error('Crop not found')

    const { cropsPerSeed, seedsPerConversion, seedProcessMinutes } = crop.conversionInfo

    const cropsCount = item.count
    const cropsNotConverted = cropsCount % cropsPerSeed
    const NORMAL_SEED_CHANCE = 0.05

    const processes = (cropsCount - cropsNotConverted) / cropsPerSeed
    const seedsProduced = processes * seedsPerConversion
    const processTime = processes * seedProcessMinutes
    const seedsItem = new CropItem(
      item.name,
      ItemType.Crop,
      crop.seedImage,
      (item.isStar ? crop.goldValues.seedStar : crop.goldValues.seed),
      item.isStar,
      30,
      seedsProduced,
      crop.type,
    )

    const normalSeedsProduced = Math.ceil(seedsProduced * NORMAL_SEED_CHANCE)

    this.insertToOutput(seedsItem)
    this.insertToOutput(new CropItem(
      item.name,
      ItemType.Seed,
      crop.seedImage,
      crop.goldValues.seed,
      false,
      30,
      normalSeedsProduced,
      crop.type,
    ))

    item.count -= cropsCount
    if (item.count === 0)
      this.hopperSlots.pop()
    else if (item.count < 0)
      throw new Error('Item count is less than 0')

    this.elapsedTimeMinutes += processTime
    this.lifeTimeMinutes += processTime
  }

  insertToOutput(item: CropItem): boolean {
    if (this.outputSlots.length >= this.maxOutputSlots) {
      const matchingItems = this.outputSlots
        .filter(outputItem => outputItem.equals(item))

      if (matchingItems.length > 0) {
        matchingItems.forEach((outputItem) => {
          const addableCount = outputItem.maxStack - outputItem.count
          if (addableCount > 0) {
            const itemCount = item.count
            outputItem.add(Math.min(addableCount, itemCount))
            item.count -= Math.min(addableCount, itemCount)
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
            const addableCount = outputItem.maxStack - outputItem.count
            if (addableCount > 0) {
              const itemCount = item.count
              outputItem.add(Math.min(addableCount, itemCount))
              item.count -= Math.min(addableCount, itemCount)
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

    if (this.hopperSlots.length >= this.maxHopperSlots) {
      const matchingItems = this.hopperSlots
        .filter(hopperItem => hopperItem.equals(item))

      if (matchingItems.length > 0) {
        matchingItems.forEach((hopperItem) => {
          const addableCount = hopperItem.maxStack - hopperItem.count
          if (addableCount > 0) {
            const itemCount = item.count
            hopperItem.add(Math.min(addableCount, itemCount))
            item.count -= Math.min(addableCount, itemCount)
          }
        })
      }
      return item.count === 0
    }

    else if (this.hopperSlots.length < this.maxHopperSlots) {
      if (this.hopperSlots.length > 0) {
        const matchingItems = this.hopperSlots
          .filter(hopperItem => hopperItem.equals(item))

        if (matchingItems.length > 0) {
          matchingItems.forEach((hopperItem) => {
            const addableCount = hopperItem.maxStack - hopperItem.count
            if (addableCount > 0) {
              const itemCount = item.count
              hopperItem.add(Math.min(addableCount, itemCount))
              item.count -= Math.min(addableCount, itemCount)
            }
          })

          return item.count === 0
        }
        else {
          this.hopperSlots.push(item)
          console.log('item added to seeder hopper')
          return true
        }
      }
      else {
        this.hopperSlots.push(item)
        console.log('item added to seeder hopper')
        return true
      }
    }

    return false
  }
}
