import type { CropLogItem, IItem } from '../Items/Item'
import crops from '../../cropList'
import { CropItem } from '../Items/Item'

import ItemType from '../../enums/itemType'

import { CropType } from '../../imports'
import type { ICrafter, InsertItemArgs } from './ICrafter'

// The number of minutes in an in-game day
const DAY_IN_MINUTES = 60

export class Seeder implements ICrafter {
  name: string = 'Seeder'

  type: ItemType.Seed = ItemType.Seed

  hopperSlots: CropItem[] = []

  maxHopperSlots: number = 1

  outputSlots: CropItem[] = []

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

  /**
   * Processes the items in the jar until the specified day.
   * @param tillDay The day until which the items should be processed. 0 or less means to ignore the day limit.
   */
  process(tillDay: number): void {
    // Available time dictates how many items can be processed later on
    // 0 or less means to ignore the day limit
    const dayInMinutes = (tillDay > 0) ? tillDay * DAY_IN_MINUTES : Number.POSITIVE_INFINITY

    try {
      for (const hopperItem of this.hopperSlots) {
        const availableTime = dayInMinutes - this._lifeTimeMinutes
        const crop = crops[hopperItem.cropType]
        const { preserveProcessMinutes } = crop.conversionInfo
        if (crop.type === CropType.None)
          throw new Error('Crop type is None')

        const matchingOutputItems = this.getMatchingOutputSlots(hopperItem)

        // Available processes is the number of times the item can be processed till the specified day
        let availableProcesses = Math.floor(availableTime / preserveProcessMinutes)
        if (availableProcesses === 0)
          return

        matchingOutputItems.forEach((outputItem) => {
          switch (true) {
            case hopperItem.count === 0:
            case availableProcesses === 0:
              return
            case availableProcesses < 0:
              throw new Error('maxProcesses is somehow less than 0')
          }

          let amountToProcess = Math.min(outputItem.maxStack - outputItem.count, hopperItem.count)
          amountToProcess = Math.min(amountToProcess, availableProcesses)

          if (!this.settings.useStackLimit)
            amountToProcess = hopperItem.count

          const timeToProcess = amountToProcess * preserveProcessMinutes

          const newPreserveItem = this.createPreserveItem(hopperItem, amountToProcess)
          hopperItem.take(amountToProcess)
          outputItem.add(amountToProcess)

          this._lifeTimeMinutes += timeToProcess
          this._elapsedTimeMinutes += timeToProcess
          this._goldGenerated += newPreserveItem.price * newPreserveItem.count
          // Now that the item has been processed, reduce the available processes for next checks
          availableProcesses -= amountToProcess
        })

        if (hopperItem.count === 0)
          continue

        // If there are still items left, try adding them to empty slots
        while (hopperItem.count > 0 && this.outputSlots.length < this.maxOutputSlots) {
          switch (true) {
            case availableProcesses === 0:
              return
            case availableProcesses < 0:
              throw new Error('maxProcesses is somehow less than 0')
          }

          let amountToProcess = (this.settings.useStackLimit) ? Math.min(hopperItem.count, hopperItem.maxStack) : hopperItem.count
          amountToProcess = Math.min(amountToProcess, availableProcesses)
          const newPreserveItem = this.createPreserveItem(hopperItem, amountToProcess)
          hopperItem.take(amountToProcess)
          this.outputSlots.push(newPreserveItem)

          const timeToProcess = amountToProcess * preserveProcessMinutes
          this._lifeTimeMinutes += timeToProcess
          this._elapsedTimeMinutes += timeToProcess
          this._goldGenerated += newPreserveItem.price * newPreserveItem.count

          availableProcesses -= amountToProcess
        }
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
    // throw new Error('Method not implemented.')
    const item = itemData.item
    const matchingItems = this.getMatchingHopperSlots(item)

    const dayInMinutes = itemData.day * DAY_IN_MINUTES

    // If there are matching items, add to them first
    if (matchingItems.length) {
      matchingItems.forEach((matchingItem) => {
        switch (true) {
          case item.count === 0:
            return true
          case item.count < 0:
            throw new Error('Item count is somehow less than 0')
        }

        const addableAmount = matchingItem.maxStack - matchingItem.count
        const amountToAdd = (this.settings.useStackLimit) ? Math.min(item.count, addableAmount) : item.count
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
      const amountToAdd = (this.settings.useStackLimit) ? Math.min(item.count, item.maxStack) : item.count

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

  private getMatchingHopperSlots(item: CropItem): CropItem[] {
    return this.hopperSlots.filter(hopperItem => item.equals(hopperItem))
  }

  private getMatchingOutputSlots(item: CropItem): CropItem[] {
    return this.outputSlots.filter(outputItem => item.equals(outputItem))
  }

  collect(day: number = 0): IItem[] {
    for (const outputItem of this.outputSlots) {
      this.initialiseLogCollection(day)
      this._logs.collections[day].push(outputItem.logItem(outputItem.count) as CropLogItem)
    }

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

  /**
   * Creates a preserved crop item based on the given crop item and count.
   *
   * @param item - The crop item to be preserved.
   * @param count - The number of crop items to be preserved.
   * @returns The preserved crop item.
   */
  private createPreserveItem(item: CropItem, count: number): CropItem {
    const image = crops[item.cropType].preserveImage
    const price = (item.isStar) ? crops[item.cropType].goldValues.preserveStar : crops[item.cropType].goldValues.preserve
    const preserveItem = new CropItem(
      item.name,
      ItemType.Preserve,
      image,
      price,
      item.isStar,
      item.maxStack,
      count,
      item.cropType,
    )
    return preserveItem
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
}
