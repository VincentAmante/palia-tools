import { getCropFromType } from '../cropList'
import { CropType } from '../imports'
import { ItemType } from '../utils/garden-helpers'
import type { IInventoryItem } from '../utils/garden-helpers'
import { CropItem, type Item } from './items/item'

// Interface for a single inventory change entry
export interface InventoryEntry {
  day: number
  item: Item // A copy of the item state at the time of the entry
  countChange: number // Positive for addition, negative for subtraction
  reason: string // Source/reason for the change (e.g., 'Harvest', 'Processing', 'Replant')
}

// Structure to hold the final calculated state of items
export interface InventoryItemState {
  item: Item // Represents the item type (name, price, etc.), count is irrelevant here
  count: number // The final calculated count
}

/**
 * Inventory class
 * - Tracks daily additions and subtractions of items.
 * - Calculates total inventory state and value.
 */
export class Inventory {
  // Stores a log of all inventory changes, keyed by day
  private _log: Map<number, InventoryEntry[]> = new Map()
  // Cache for calculated total inventory state
  private _totalItemsCache: Map<string, InventoryItemState> | null = null

  /**
   * Clears the inventory log and cache.
   */
  public clear(): void {
    this._log.clear()
    this._totalItemsCache = null
  }

  /**
   * Adds an entry to the inventory log.
   * @param day - The day the change occurred.
   * @param item - The item involved.
   * @param countChange - The amount added (positive) or removed (negative).
   * @param reason - The reason for the change.
   */
  private _addEntry(day: number, item: Item, countChange: number, reason: string): void {
    if (!this._log.has(day))
      this._log.set(day, [])

    // Create a snapshot of the item for the log entry
    const itemSnapshot = Object.assign(Object.create(Object.getPrototypeOf(item)), item)

    this._log.get(day)?.push({
      day,
      item: itemSnapshot,
      countChange,
      reason,
    })
    // Invalidate cache when log changes
    this._totalItemsCache = null
  }

  /**
   * Adds items to the inventory.
   * @param day - The day the items were added.
   * @param item - The item to add.
   * @param count - The number of items to add (must be positive).
   * @param reason - The reason for adding the items.
   */
  public add(day: number, item: Item, count: number, reason: string): void {
    if (count <= 0) {
      console.warn(`Attempted to add non-positive count (${count}) for item ${item.itemId} on day ${day}. Ignoring.`)
      return
    }
    this._addEntry(day, item, count, reason)
  }

  /**
   * Subtracts items from the inventory.
   * @param day - The day the items were removed.
   * @param item - The item to subtract.
   * @param count - The number of items to subtract (must be positive).
   * @param reason - The reason for removing the items.
   */
  public subtract(day: number, item: Item, count: number, reason: string): void {
    if (count <= 0) {
      console.warn(`Attempted to subtract non-positive count (${count}) for item ${item.itemId} on day ${day}. Ignoring.`)
      return
    }
    this._addEntry(day, item, -count, reason)
  }

  /**
   * Adds an item based on the IInventoryItem interface structure.
   * Converts IInventoryItem to a concrete Item instance before adding.
   * @param day - The day the item was added.
   * @param inventoryItemData - The data conforming to IInventoryItem.
   * @param reason - The reason for adding the item.
   */
  public addItemFromIInventoryItem(day: number, inventoryItemData: IInventoryItem, reason: string): void {
    const item = this._createItemFromIInventoryItem(inventoryItemData)
    if (item)
      this.add(day, item, inventoryItemData.count, reason)
    else
      console.error(`Failed to create Item from IInventoryItem for ${inventoryItemData.cropType} on day ${day}`)
  }

  /**
   * Helper to convert IInventoryItem to a concrete Item (specifically CropItem).
   * Requires access to crop definitions.
   * @param data - The IInventoryItem data.
   * @returns A CropItem instance or null if conversion fails.
   */
  private _createItemFromIInventoryItem(data: IInventoryItem): Item | null {
    if (data.itemType !== ItemType.Crop && data.itemType !== ItemType.Seed && data.itemType !== ItemType.Preserve) {
      console.warn(`Cannot create CropItem for non-crop/seed/preserve type: ${data.itemType}`)
      // TODO: Handle other item types if needed in the future
      return null
    }

    const crop = getCropFromType(data.cropType)
    if (!crop) {
      console.error(`Crop definition not found for type: ${data.cropType}`)
      return null
    }

    let name: string
    let image: string
    let price: number
    const maxStack = 30 // Assuming default stack size, adjust if needed

    switch (data.itemType) {
      case ItemType.Crop:
        name = crop.type
        image = crop.image
        price = data.isStar ? crop.goldValues.cropStar : crop.goldValues.crop
        break
      case ItemType.Seed:
        name = `${crop.type} Seed`
        image = crop.seedImage
        price = data.isStar ? crop.goldValues.seedStar : crop.goldValues.seed
        break
      case ItemType.Preserve:
        if (!crop.goldValues.hasPreserve) {
          console.warn(`Attempted to create preserve item for ${crop.type}, which cannot be preserved.`)
          return null
        }
        name = `Jar of ${crop.type}` // Or specific preserve name if available
        image = crop.preserveImage
        price = data.isStar ? crop.goldValues.preserveStar : crop.goldValues.preserve
        break
      default:
        // Should be unreachable due to the initial check
        return null
    }

    return new CropItem(name, data.itemType, image, price, data.isStar, maxStack, data.count, data.cropType)
  }

  /**
   * Calculates the final count of each item across all logged days.
   * Uses caching for performance.
   * @returns A Map where keys are item IDs and values are InventoryItemState.
   */
  public getTotalItems(): Map<string, InventoryItemState> {
    if (this._totalItemsCache)
      return this._totalItemsCache

    const totals = new Map<string, InventoryItemState>()
    const sortedDays = Array.from(this._log.keys()).sort((a, b) => a - b)

    for (const day of sortedDays) {
      const entries = this._log.get(day) || []
      for (const entry of entries) {
        const itemId = entry.item.itemId
        if (!totals.has(itemId)) {
          // Store the item definition (without count) and initialize count
          const itemDefinition = Object.assign(Object.create(Object.getPrototypeOf(entry.item)), entry.item)
          itemDefinition.count = 0 // Count in the definition is irrelevant here
          totals.set(itemId, { item: itemDefinition, count: 0 })
        }
        totals.get(itemId)!.count += entry.countChange
      }
    }

    // Filter out items with zero or negative final count
    for (const [itemId, state] of totals) {
      if (state.count <= 0)
        totals.delete(itemId)
    }

    this._totalItemsCache = totals
    return totals
  }

  /**
   * Calculates the net change of items for a specific day.
   * @param day - The day to calculate changes for.
   * @returns A Map where keys are item IDs and values are the net count change for that day.
   */
  public getNetItemChangesByDay(day: number): Map<string, number> {
    const dailyChanges = new Map<string, number>()
    const entries = this._log.get(day) || []

    for (const entry of entries) {
      const itemId = entry.item.itemId
      const currentChange = dailyChanges.get(itemId) || 0
      dailyChanges.set(itemId, currentChange + entry.countChange)
    }
    return dailyChanges
  }

  /**
   * Gets all inventory log entries for a specific day.
   * @param day - The day to retrieve entries for.
   * @returns An array of InventoryEntry objects for the specified day, or an empty array if none exist.
   */
  public getLogEntriesByDay(day: number): InventoryEntry[] {
    return this._log.get(day) || []
  }

  /**
   * Calculates the total gold value of all items currently in the inventory.
   * @returns The total gold value.
   */
  public getTotalValue(): number {
    const totalItems = this.getTotalItems()
    let totalValue = 0
    for (const state of totalItems.values())
      totalValue += state.item.price * state.count

    return totalValue
  }

  /**
   * Calculates the total gold value of the net change of items for a specific day.
   * Note: This represents the value change on that day, not the total inventory value on that day.
   * @param day - The day to calculate the value change for.
   * @returns The net gold value change for the specified day.
   */
  public getNetValueChangeByDay(day: number): number {
    const dailyChanges = this.getNetItemChangesByDay(day)
    let dailyValueChange = 0
    const entries = this._log.get(day) || [] // Need entries to get item price info

    // Use a map to get unique items and their prices for the day
    const itemPrices = new Map<string, number>()
    for (const entry of entries) {
      if (!itemPrices.has(entry.item.itemId))
        itemPrices.set(entry.item.itemId, entry.item.price)
    }

    for (const [itemId, netChange] of dailyChanges) {
      const price = itemPrices.get(itemId) || 0
      dailyValueChange += price * netChange
    }

    return dailyValueChange
  }

  /**
   * Gets the total final count of items filtered by a specific ItemType.
   * @param type - The ItemType to filter by.
   * @returns A Map where keys are item IDs and values are InventoryItemState, filtered by type.
   */
  public getTotalItemsByType(type: ItemType): Map<string, InventoryItemState> {
    const totalItems = this.getTotalItems()
    const filteredItems = new Map<string, InventoryItemState>()
    for (const [itemId, state] of totalItems) {
      if (state.item.type === type)
        filteredItems.set(itemId, state)
    }
    return filteredItems
  }

  /**
   * Gets the net change of items for a specific day, filtered by ItemType.
   * @param day - The day to calculate changes for.
   * @param type - The ItemType to filter by.
   * @returns A Map where keys are item IDs and values are the net count change for that day, filtered by type.
   */
  public getNetItemChangesByDayByType(day: number, type: ItemType): Map<string, number> {
    const dailyChanges = new Map<string, number>()
    const entries = this._log.get(day) || []

    for (const entry of entries) {
      if (entry.item.type === type) {
        const itemId = entry.item.itemId
        const currentChange = dailyChanges.get(itemId) || 0
        dailyChanges.set(itemId, currentChange + entry.countChange)
      }
    }
    return dailyChanges
  }
}
