import type { CropLogItem, IItem } from '../Items/Item'
import crops from '../../cropList'
import { CropItem } from '../Items/Item'

import ItemType from '../../enums/itemType'

import { CropType } from '../../imports'
import type { ICrafter, IDedicatedCrop, InsertItemArgs } from './ICrafter'

// The number of minutes in an in-game day
const DAY_IN_MINUTES = 60

export class Seeder implements ICrafter {
  name: string = 'Seeder'

  type: ItemType.Seed = ItemType.Seed

  hopperSlots: CropItem[] = []

  maxHopperSlots: number = 1

  outputSlots: CropItem[] = []

  _waitingSlot: CropItem | null = null

  maxOutputSlots: number = 3

  acceptedItems: ItemType[] = [ItemType.Crop]

  _lifeTimeMinutes: number = 0

  _elapsedTimeMinutes: number = 0

  settings = {
    useStackLimit: true,
    useHopperLimit: true,
  }

  _logs: {
    insertions: Record<number, CropLogItem[]>
    collections: Record<number, CropLogItem[]>
  } = {
      insertions: {},
      collections: {},
    }

  _goldGenerated: number = 0

  resetTime(): void {
    this._lifeTimeMinutes = 0
    this._elapsedTimeMinutes = 0
  }

  resetLogs(): void {
    this._logs = {
      insertions: {},
      collections: {},
    }
  }

  private _dedicatedCrop: IDedicatedCrop | null = null

  /**
   * Processes the items in the jar until the specified day.
   * @param tillDay The day until which the items should be processed. 0 or less means to ignore the day limit.
   */
  process(tillDay: number): void {
    // Available time dictates how many items can be processed later on
    // 0 or less means to ignore the day limit
    const dayInMinutes = (tillDay > 0) ? tillDay * DAY_IN_MINUTES : Number.POSITIVE_INFINITY

    if (this._waitingSlot) {
      this._goldGenerated += (this._waitingSlot.price * this._waitingSlot.count)
      this.insertToOutputSlots(this._waitingSlot)
      this._waitingSlot = null
    }

    try {
      // TODO: Add a check to take from multiple hopper slots if the item taken is more than the max stack
      for (const hopperItem of this.hopperSlots) {
        const availableTime = dayInMinutes - this._lifeTimeMinutes
        const crop = crops[hopperItem.cropType]
        const { seedProcessMinutes, cropsPerSeed, seedsPerConversion } = crop.conversionInfo
        if (crop.type === CropType.None)
          throw new Error('Crop type is None')

        // Available processes is the number of times the item can be processed till the specified day
        let availableProcesses = Math.floor(availableTime / seedProcessMinutes)

        if (availableProcesses === 0)
          return

        availableProcesses = Math.min(this.getMaxAvailableProcesses(hopperItem), availableProcesses)
        availableProcesses = Math.min(Math.floor(hopperItem.count / cropsPerSeed), availableProcesses)

        if (hopperItem.isStar) {
          const nonStarItem = hopperItem.cloneAltQuality(0, false)
          availableProcesses = Math.min(this.getMaxCraftableExtraSeeds(nonStarItem), availableProcesses)
        }

        if (availableProcesses === 0)
          return

        const processableSeeds = Math.floor(hopperItem.count / cropsPerSeed)

        const processes = Math.min(processableSeeds, availableProcesses)

        hopperItem.take(processes * cropsPerSeed) as CropItem

        const seedsMade = processes * seedsPerConversion

        const seedItem = createSeedItem(hopperItem, seedsMade)

        this._goldGenerated += (seedItem.price * seedItem.count)
        this._elapsedTimeMinutes += (processes * seedProcessMinutes)
        this._lifeTimeMinutes += (processes * seedProcessMinutes)

        this.insertToOutputSlots(seedItem)

        // If there's time left before the day ends, process the next item and add it to the waiting slot
        if (this._lifeTimeMinutes < (tillDay * DAY_IN_MINUTES)) {
          const nextHopperItem = this.hopperSlots[0]
          if (nextHopperItem && nextHopperItem.count >= cropsPerSeed) {
            const nextCrop = crops[nextHopperItem.cropType]
            const { seedProcessMinutes } = nextCrop.conversionInfo

            const roomForOneProcess = this.getMaxAvailableProcesses(nextHopperItem) > 0

            if (roomForOneProcess) {
              const nextSeedItem = createSeedItem(nextHopperItem, seedsPerConversion)

              this._waitingSlot = nextSeedItem

              nextHopperItem.take(cropsPerSeed) as CropItem

              this._elapsedTimeMinutes += seedProcessMinutes

              this._lifeTimeMinutes += seedProcessMinutes
            }
          }
        }

        if (hopperItem.count === 0)
          continue
      }
    }
    catch (error) {
      console.error(`Error processing items: ${error}`)
    }
    finally {
      // Remove any empty hopper slots
      this.hopperSlots = this.hopperSlots.filter(hopperItem => hopperItem.count > 0)
    }
  }

  insertToOutputSlots(item: CropItem): boolean {
    if (item.count === 0)
      throw new Error(`Item being inserted has a count of 0 ${item.type} ${item.name}`)

    // Add to existing items first
    const matchingItems = this.getMatchingOutputSlots(item)
      .filter(outputItem => (outputItem.count < outputItem.maxStack || !this.settings.useStackLimit))
      // Prioritise items closest to max stack
      .sort((a, b) => a.count - b.count)

    if (matchingItems.length > 0) {
      for (const matchingItem of matchingItems) {
        const amountToAdd = (this.settings.useStackLimit) ? Math.min(item.count, item.maxStack - matchingItem.count) : item.count
        matchingItem.add(amountToAdd)
        item.take(amountToAdd)

        if (item.count === 0)
          return true
      }
    }

    do {
      const amountToAdd = (this.settings.useStackLimit) ? Math.min(item.count, item.maxStack) : item.count
      const newItem = item.take(amountToAdd) as CropItem

      this.outputSlots.push(newItem)

      if (item.count === 0)
        return true
      if (item.count < 0)
        throw new Error(`Item count is somehow less than 0, ${item.type} ${item.name}`)
    } while (this.outputSlots.length < this.maxOutputSlots || !this.settings.useHopperLimit)

    return false
  }

  /**
   * Initialises the log insertion for a specific day.
   * @param day - The day for which to initialise the log insertion.
   */
  private initialiseLogInsertion(day: number) {
    if (!this._logs.insertions[day])
      this._logs.insertions[day] = []
  }

  /**
   * Initialises the log collection for a specific day.
   * @param day - The day for which to initialise the log collection.
   */
  private initialiseLogCollection(day: number) {
    if (!this._logs.collections[day])
      this._logs.collections[day] = []
  }

  /**
   * Inserts the specified item into the crafter.
   * @param itemData The item to insert and the day on which it was inserted.
   * @returns True if the item was fully inserted. Used to determine if the item should be removed from the inventory.
   */
  insertItem(itemData: InsertItemArgs & { item: CropItem }): boolean {
    const item = itemData.item
    const matchingItems = this.getMatchingHopperSlots(item)

    if (itemData.day < 1)
      throw new Error('Day is less than 1')

    const dayInMinutes = (itemData.day) * DAY_IN_MINUTES

    const { cropsPerSeed } = crops[item.cropType].conversionInfo

    // If there are matching items, add to them first
    if (matchingItems.length) {
      matchingItems.forEach((matchingItem) => {
        switch (true) {
          case item.count === 0:
            return true
          case item.count < 0:
            throw new Error('Item count is somehow less than 0')
        }

        const addableAmount = (matchingItem.maxStack - matchingItem.count)

        if (addableAmount < cropsPerSeed) {
          // console.log('Addable amount is less than crops per seed', addableAmount, cropsPerSeed)
          return false
        }

        let amountToAdd = (this.settings.useStackLimit) ? Math.min(item.count, addableAmount) : item.count

        // Reduce the amount to add to the nearest multiple of crops per seed
        amountToAdd = amountToAdd - ((matchingItem.count + amountToAdd) % cropsPerSeed)
        const newItem = item.take(amountToAdd) as CropItem
        matchingItem.count += newItem.count

        if (amountToAdd > 0) {
          // * This is so lifetime can also include the amount of time the crafter has been idle
          this._lifeTimeMinutes = Math.max(this._lifeTimeMinutes, dayInMinutes)
          this.initialiseLogInsertion(itemData.day)
          this._logs.insertions[itemData.day].push(newItem.logItem())
        }
      })
    }

    if (item.count === 0)
      return true
    if ((this.hopperSlots.length >= this.maxHopperSlots) && this.settings.useHopperLimit)
      return false

    // If there are still items left, try adding them to empty slots
    while (item.count > 0 && (this.hopperSlots.length < this.maxHopperSlots || !this.settings.useHopperLimit)) {
      let amountToAdd = (this.settings.useStackLimit) ? Math.min(item.count, item.maxStack) : item.count
      amountToAdd = amountToAdd - (amountToAdd % cropsPerSeed)

      if (amountToAdd < cropsPerSeed) {
        // console.log('Amount to add is less than crops per seed', amountToAdd, cropsPerSeed)
        return false
      }

      // const newItem = new CropItem(item.name, ItemType.Crop, item.image, item.price, item.isStar, item.maxStack, amountToAdd, item.cropType)
      const newItem = item.take(amountToAdd) as CropItem
      this.hopperSlots.push(newItem)

      if (amountToAdd > 0) {
        // * This is so lifetime can also include the amount of time the crafter has been idle
        this._lifeTimeMinutes = Math.max(this._lifeTimeMinutes, dayInMinutes)
        this.initialiseLogInsertion(itemData.day)
        this._logs.insertions[itemData.day].push(item.logItem(amountToAdd) as CropLogItem)
      }
    }

    return item.count === 0
  }

  /**
   *  When processing a star crop, we need room for at least 1 non-star seed to be made
   * @param item - The item to check for availability, must be the non-star version of the item
   * @returns
   */
  private getMaxCraftableExtraSeeds(item: CropItem): number {
    const { useHopperLimit, useStackLimit } = this.settings

    if (item.isStar)
      throw new Error('Item is a star item')

    if (!useHopperLimit || !useStackLimit)
      return Number.POSITIVE_INFINITY
    // Processing star items require room for at least 1 non-star item

    // Get any matching items in the output slots, excluding items that are already at max stack
    const matchingItems = this.getMatchingOutputSlots(item).filter(hopperItem => hopperItem.count < hopperItem.maxStack)

    if (this.outputSlots.length >= this.maxOutputSlots) {
      if (matchingItems.length === 0)
        return 0
    }

    let craftableSeeds = Math.max(0, (this.maxOutputSlots - this.outputSlots.length) * item.maxStack)

    const spaceWithinExistingSlots = (matchingItems.length * item.maxStack) - matchingItems.reduce((total, item) => total + item.count, 0)
    craftableSeeds += Math.max(0, spaceWithinExistingSlots)

    return craftableSeeds
  }

  /**
   * Regular method for getting the max craftable seeds
   * @param item - The item to check for availability
   */
  private getMaxAvailableProcesses(cropItem: CropItem): number {
    if (!this.settings.useStackLimit || !this.settings.useHopperLimit)
      return Number.POSITIVE_INFINITY

    const matchingItems = this.getMatchingHopperSlots(cropItem).filter(hopperItem => hopperItem.count < hopperItem.maxStack)

    if (this.outputSlots.length >= this.maxOutputSlots) {
      if (matchingItems.length === 0)
        return 0
    }

    let availableProcesses = 0

    const maxItems = cropItem.maxStack * (matchingItems.length + Math.max(0, this.maxOutputSlots - this.outputSlots.length))

    const itemsBeforeLimit = maxItems - matchingItems.reduce((total, item) => total + item.count, 0)

    const { seedsPerConversion } = crops[cropItem.cropType].conversionInfo

    availableProcesses = Math.floor(itemsBeforeLimit / seedsPerConversion)

    return availableProcesses
  }

  private getMatchingHopperSlots(item: CropItem): CropItem[] {
    return this.hopperSlots.filter(hopperItem => item.equals(hopperItem))
  }

  private getMatchingOutputSlots(item: CropItem): CropItem[] {
    return this.outputSlots.filter(outputItem => item.equals(outputItem))
  }

  collect(day: number = 0): IItem[] {
    if (this.outputSlots.length === 0)
      return []

    this.initialiseLogCollection(day)

    for (const outputItem of this.outputSlots)
      this._logs.collections[day].push(outputItem.logItem(outputItem.count) as CropLogItem)

    return this.outputSlots.splice(0, this.outputSlots.length)
  }

  /**
   * Sets the settings of the Jar.
   * @param settings - The settings to be set.
   */
  setSettings(settings: Partial<Seeder['settings']>): void {
    if (settings.useStackLimit !== undefined)
      this.settings.useStackLimit = settings.useStackLimit
    if (settings.useHopperLimit !== undefined)
      this.settings.useHopperLimit = settings.useHopperLimit
  }

  get elapsedTimeMinutes(): number {
    return this._elapsedTimeMinutes
  }

  get lifeTimeMinutes(): number {
    return this._lifeTimeMinutes
  }

  get goldGenerated(): number {
    return this._goldGenerated
  }

  get logs(): Seeder['_logs'] {
    return this._logs
  }

  get dedicatedCrop(): IDedicatedCrop | null {
    return this._dedicatedCrop
  }

  set dedicatedCrop(dedicatedCropData: IDedicatedCrop | null) {
    this._dedicatedCrop = dedicatedCropData
  }

  get combinedLogs(): Record<number, {
    insertions: CropLogItem[]
    collections: CropLogItem[]
  }> {
    const combinedLogs: Record<number, {
      insertions: CropLogItem[]
      collections: CropLogItem[]
    }> = {}
    const days = new Set([...Object.keys(this._logs.insertions), ...Object.keys(this._logs.collections)])
    days.forEach((day) => {
      const dayParsed = Number.parseInt(day)
      combinedLogs[dayParsed] = {
        insertions: this._logs.insertions[dayParsed],
        collections: this._logs.collections[dayParsed],
      }

      if (!combinedLogs[dayParsed].insertions)
        combinedLogs[dayParsed].insertions = []
      if (!combinedLogs[dayParsed].collections)
        combinedLogs[dayParsed].collections = []
    })

    return combinedLogs
  }

  get hasItemsInside(): boolean {
    return this.hopperSlots.length > 0 || this.outputSlots.length > 0 || this._waitingSlot !== null
  }

  get waitingSlot(): CropItem | null {
    return this._waitingSlot
  }

  // Clears the crafter of all items
  flush(): void {
    this.hopperSlots = []
    this.outputSlots = []
    this._waitingSlot = null
  }
}

/**
   * Creates a preserved crop item based on the given crop item and count.
   *
   * @param item - The crop item to be preserved.
   * @param count - The number of crop items to be preserved.
   * @returns The preserved crop item.
   */
function createSeedItem(item: CropItem, count: number): CropItem {
  const image = crops[item.cropType].seedImage
  const price = (item.isStar) ? crops[item.cropType].goldValues.seedStar : crops[item.cropType].goldValues.seed
  const preserveItem = new CropItem(
    item.name,
    ItemType.Seed,
    image,
    price,
    item.isStar,
    item.maxStack,
    count,
    item.cropType,
  )
  return preserveItem
}
