import type { IItem } from './Items/Item'

interface IDayLog {
  gold: number
  items: IItem[]
}

export interface IShippingBin {
  readonly inventory: Record<string, IItem>
  add(item: IItem, dayAdded: number): void
  readonly totalGold: number
  readonly days: number[]
  getDayLog(day: number): IDayLog
  clear(): void
}

export default class ShippingBin implements IShippingBin {
  // Final inventory after all items have been added
  private _inventory: Record<string, IItem> = {}

  // Tracks the day that an item was added to the shipping bin
  private _log: Record<string, IItem[]> = {}

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
  add(item: IItem, dayAdded: number = 0): void {
    // TODO: Figure out how stacks work in the shipping bin

    if (this._inventory[item.id])
      this._inventory[item.id].add(item.count)
    else
      this._inventory[item.id] = item

    if (dayAdded) {
      if (!this._log[dayAdded])
        this._log[dayAdded] = []

      this._log[dayAdded].push(item)
    }
  }

  /**
   * Returns the total value of all items in the shipping bin.
   */
  get totalGold(): number {
    let total = 0
    for (const item of Object.values(this._inventory))
      total += item.price * item.count

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
    if (!items) {
      console.warn(`No items found for day ${day}`)
      return {
        gold: 0,
        items: [],
      }
    }

    let gold = 0
    for (const item of items)
      gold += item.price * item.count

    return {
      gold,
      items,
    }
  }

  /**
   * Clears the shipping bin's inventory.
   */
  clear(): void {
    this._inventory = {}
    this._log = {}
  }
}