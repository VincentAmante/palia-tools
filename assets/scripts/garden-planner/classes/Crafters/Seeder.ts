import { CropItem, ItemType } from '../items/Item'

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
  settings = {
    useStackLimit: true,
    useHopperLimit: true,
    includeNormalSeeds: true,
  }

  goldGenerated: number = 0

  process(): void {
    if (this.hopperSlots.length === 0)
      return
    const item = this.hopperSlots[0]
    const crop = crops[item.cropType]
    if (crop === undefined || crop === null)
      throw new Error('Crop not found')

    const { cropsPerSeed, seedsPerConversion, seedProcessMinutes } = crop.conversionInfo

    if (!this.hasSpaceToProcess(item.isStar))
      return

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

    this.goldGenerated += seedsItem.price * seedsItem.count

    const normalSeedsProduced = (this.settings.includeNormalSeeds) ? Math.round(seedsProduced * NORMAL_SEED_CHANCE) : 0

    this.goldGenerated += normalSeedsProduced * crop.goldValues.seed

    if (seedsItem.count > 0)
      this.insertToOutput(seedsItem)
    if (normalSeedsProduced > 0)
      this.insertToOutput(this.createNormalSeedItem(seedsItem, normalSeedsProduced))

    item.count -= cropsCount - cropsNotConverted
    if (item.count === 0)
      this.hopperSlots.shift()
    else if (item.count < 0)
      throw new Error('Item count is less than 0')

    this.elapsedTimeMinutes += processTime
    this.lifeTimeMinutes += processTime
  }

  insertToOutput(item: CropItem): boolean {
    const { existingSlots, hasEmptySlot } = this.getOutputAvailability(item)

    if (existingSlots) {
      for (const slot of existingSlots) {
        const addable = (this.settings.useStackLimit ? slot.maxStack - slot.count : item.count)
        if (addable > 0) {
          const itemCount = item.count
          slot.add(Math.min(addable, itemCount))
          item.count -= Math.min(addable, itemCount)
        }
      }
    }

    if (item.count === 0)
      return true

    if (hasEmptySlot) {
      if (this.settings.useStackLimit) {
        while (this.outputSlots.length < this.maxOutputSlots && item.count > 0) {
          const itemStacks = item.inventoryStacks
          const itemStack = itemStacks.shift()

          if (!itemStack)
            throw new Error('Item stack not found')

          this.outputSlots.push(itemStack)
          item.count -= itemStack.count
        }

        return item.count === 0
      }
      else {
        this.outputSlots.push(item)
        return true
      }
    }

    return false
  }

  // Clears the output slots and returns the processed items
  collectOutput(): CropItem[] {
    const output = [...this.outputSlots]
    this.outputSlots = []
    return output
  }

  // Returns true if the item was fully inserted
  insertItem(itemData: InsertItemArgs & { item: CropItem }): boolean {
    const { day, item } = itemData

    // Accepts only crops for seeding
    if (!this.acceptedItems.includes(item.type))
      return false

    // Update the lifetime of the seeder to include idle time before the first item was inserted
    // this is to track a number of stuff like processing time, gold generated, and number of processable items
    const minutes = day * 60
    if (this.lifeTimeMinutes === 0)
      this.lifeTimeMinutes = minutes
    else if (this.lifeTimeMinutes < minutes)
      this.lifeTimeMinutes = minutes

    const { existingSlots, hasEmptySlot } = this.getHopperAvailability(item)
    if (existingSlots) {
      for (const slot of existingSlots) {
        const addable = (this.settings.useStackLimit ? slot.maxStack - slot.count : item.count)
        if (addable > 0) {
          const itemCount = item.count
          slot.add(Math.min(addable, itemCount))
          item.count -= Math.min(addable, itemCount)
        }
      }
    }

    if (item.count === 0)
      return true

    if (hasEmptySlot) {
      if (this.settings.useStackLimit) {
        while (this.hopperSlots.length < this.maxHopperSlots && item.count > 0) {
          const itemStacks = item.inventoryStacks
          const itemStack = itemStacks.shift()

          if (!itemStack)
            throw new Error('Item stack not found')

          this.hopperSlots.push(itemStack)
          item.count -= itemStack.count
        }

        return item.count === 0
      }
      else {
        this.hopperSlots.push(item)
        return true
      }
    }

    return false
  }

  setSettings(settings: Partial<Seeder['settings']>): void {
    this.settings.useStackLimit = settings.useStackLimit ?? this.settings.useStackLimit
    this.settings.useHopperLimit = settings.useHopperLimit ?? this.settings.useHopperLimit
    this.settings.includeNormalSeeds = settings.includeNormalSeeds ?? this.settings.includeNormalSeeds
  }

  private getOutputAvailability(item: CropItem): {
    existingSlots?: CropItem[]
    hasEmptySlot: boolean
  } {
    const matchingSlots = this.outputSlots.filter(outputItem => outputItem.equals(item))
    const hasEmptySlot = this.outputSlots.length < this.maxOutputSlots

    return {
      hasEmptySlot,
      existingSlots: matchingSlots,
    }
  }

  private hasSpaceToProcess(itemIsStar: boolean): boolean {
    if (this.hopperSlots.length === 0)
      return false

    const item = this.hopperSlots[0]
    const crop = crops[item.cropType]
    if (!crop)
      throw new Error('Crop not found')

    const { seedsPerConversion } = crop.conversionInfo

    const MIN_SLOTS_NEEDED = (itemIsStar ? 2 : 1)

    // Handler for when there is not enough space in the output slots
    if (this.outputSlots.length <= (this.maxOutputSlots - MIN_SLOTS_NEEDED) || !this.settings.useHopperLimit)
      return true

    // Needs space for at least one seed
    let hasSpaceForSeeds = false
    const matchingSlots = this.outputSlots.filter(outputItem => outputItem.equals(item))
    if (matchingSlots.length > 0) {
      matchingSlots.forEach((outputItem) => {
        const addable = (this.settings.useStackLimit ? outputItem.maxStack - outputItem.count : item.count)
        if (addable >= seedsPerConversion)
          hasSpaceForSeeds = true
      })
    }

    if (!hasSpaceForSeeds && !itemIsStar)
      return false

    // Needs space for at least one normal seed
    let hasSpaceForNormalSeeds = false
    const normalSeedItem = new CropItem(
      item.name,
      ItemType.Seed,
      crop.seedImage,
      crop.goldValues.seed,
      false,
      30,
      1,
      crop.type,
    )

    const matchingNormalSlots = this.outputSlots.filter(outputItem => outputItem.equals(normalSeedItem))
    if (matchingNormalSlots.length > 0 && this.settings.includeNormalSeeds) {
      matchingNormalSlots.forEach((hopperItem) => {
        const addable = (this.settings.useStackLimit ? hopperItem.maxStack - hopperItem.count : item.count)
        if (addable > 0)
          hasSpaceForNormalSeeds = true
      })
    }

    if (!hasSpaceForSeeds || (!hasSpaceForNormalSeeds && this.settings.includeNormalSeeds))
      return false

    return true
  }

  private createNormalSeedItem(item: CropItem, count: number = 0): CropItem {
    const crop = crops[item.cropType]
    if (crop === undefined || crop === null)
      throw new Error('Crop not found')

    const normalSeedsProduced = count

    return new CropItem(
      item.name,
      ItemType.Seed,
      crop.seedImage,
      crop.goldValues.seed,
      false,
      30,
      normalSeedsProduced,
      crop.type,
    )
  }

  private getHopperAvailability(item: CropItem): {
    existingSlots?: CropItem[]
    hasEmptySlot: boolean
  } {
    const matchingSlots = this.hopperSlots.filter(hopperItem => hopperItem.equals(item))
    const hasEmptySlot = this.hopperSlots.length < this.maxHopperSlots

    return {
      hasEmptySlot,
      existingSlots: matchingSlots,
    }
  }

  // Returns the maximum number of items that can be processed with the current hopper and output slots
  // specifying a day or hour will return the maximum number of items that can be processed until that day or hour
  // hour is used here because crafters process regardless of being logged in or not, so Palia days are not relevant
  private getMaxProcessableItems(item: CropItem, tillHour: number = 0): number {
    const crop = crops[item.cropType]
    if (!crop)
      throw new Error('Crop not found')
    const { cropsPerSeed } = crop.conversionInfo
    const { existingSlots } = this.getOutputAvailability(item)
    const existingCrops = existingSlots ? existingSlots.reduce((acc, curr) => acc + curr.count, 0) : 0
    const cropsLeft = item.count - existingCrops
    const maxProcessableItems = Math.floor(cropsLeft / cropsPerSeed)

    if (tillHour === 0)
      return maxProcessableItems

    const minutes = tillHour * 60
    const timeLeft = minutes - this.elapsedTimeMinutes
    const processTime = maxProcessableItems * crop.conversionInfo.seedProcessMinutes
    const maxProcessableItemsWithTime = Math.floor(timeLeft / processTime)

    return Math.min(maxProcessableItems, maxProcessableItemsWithTime)
  }
}
