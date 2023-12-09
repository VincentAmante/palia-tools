import type { IItem } from './Items/Item'

interface IDayLog {
  gold: number
  items: IItem[]
  itemCosts: IItem[]
}

export interface IShippingBin {
  readonly inventory: Record<string, IItem>
  add(dayAdded: number, ...items: IItem[]): void
  addCost(dayAdded: number, ...items: IItem[]): void
  readonly totalGold: number
  readonly days: number[]
  getDayLog(day: number): IDayLog
  clear(): void
}

export default class ShippingBin implements IShippingBin {
  // Final inventory after all items have been added
  private _inventory: Record<string, IItem> = {}

  private _itemCosts: Record<string, IItem> = {}

  // Tracks the day that an item was added to the shipping bin
  private _log: Record<string, IItem[]> = {}

  // Tracks items that have to be purchased or counts as a loss
  private _logCosts: Record<string, IItem[]> = {}

  /**
   * Get the shipping bin's inventory.
   * Should be the final inventory after all items have been added.
   */
  get inventory(): Record<string, IItem> {
    return this._inventory
  }

  /**
   * Adds an item to the shipping bin's inventory.
   * @param item - The item to be added to the inventory.
   */
  add(dayAdded: number, ...items: IItem[]): void {
    const itemsToAdd = [...items]
    for (const item of itemsToAdd) {
      if (this._inventory[item.id])
        this._inventory[item.id].add(item.count)
      else
        this._inventory[item.id] = item
    }

    if (dayAdded) {
      if (!this._log[dayAdded])
        this._log[dayAdded] = itemsToAdd
      else
        this._log[dayAdded].push(...itemsToAdd)
    }
  }

  addCost(dayAdded: number, ...items: IItem[]): void {
    const itemsToAdd = [...items]
    for (const item of itemsToAdd) {
      if (this._itemCosts[item.id])
        this._itemCosts[item.id].add(item.count)
      else
        this._itemCosts[item.id] = item
    }

    if (dayAdded) {
      if (!this._logCosts[dayAdded])
        this._logCosts[dayAdded] = []

      this._logCosts[dayAdded].push(...items)
    }
  }

  /**
   * Returns the total value of all items in the shipping bin.
   */
  get totalGold(): number {
    let total = 0
    for (const item of Object.values(this._inventory))
      total += item.price * item.count

    for (const item of Object.values(this._itemCosts))
      total -= item.price * item.count

    return total
  }

  /**
   * Get all days that have items in the shipping bin, sorted in ascending order.
  */
  get days(): number[] {
    return Object.keys(this._log).map(day => Number.parseInt(day)).sort((a, b) => a - b)
  }

  /**
   * Get the total value of all items in the shipping bin on a given day.
   * @param day - The day to get the value for.
   */
  getDayLog(day: number): IDayLog {
    const items = this._log[day]
    const itemCosts = this._logCosts[day]
    if (!items) {
      console.warn(`No items found for day ${day}`)
      return {
        gold: 0,
        items: [],
        itemCosts: [],
      }
    }

    let gold = 0

    for (const item of items)
      gold += item.price * item.count

    for (const item of itemCosts)
      gold -= item.price * item.count

    return {
      gold,
      items,
      itemCosts,
    } as IDayLog
  }

  /**
   * Clears the shipping bin's inventory.
   */
  clear(): void {
    this._inventory = {}
    this._log = {}
    this._itemCosts = {}
    this._logCosts = {}
  }
}
