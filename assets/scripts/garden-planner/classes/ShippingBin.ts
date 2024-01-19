/**
 * @file ShippingBin.ts
 *
 * @brief Tracks the items in the shipping bin.
 *
 * @remarks
 * The shipping bin in-game is a chest that automatically sells items at the end of the day.
 * For this application, the shipping is used to track items being sold, purchased, or kept for later use.
 * Honestly, it should be renamed to 'Inventory' but feature-creep was a thing.
 */

import type { IItem } from './Items/Item'

export interface IDayLog {
  day: number
  gold: number
  items: IItem[]
  itemCosts: IItem[]
}

export interface IShippingBin {
  readonly inventory: Record<string, IItem>

  // Adds an item to the shipping bin's inventory
  add(dayAdded: number, ...items: IItem[]): void

  // Cost of items that have to be purchased or counts as a loss
  addCost(dayAdded: number, ...items: IItem[]): void

  addLeftover(dayAdded: number, ...items: IItem[]): void

  readonly totalGold: number
  readonly days: number[]
  readonly logs: IDayLog[]
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
        this._inventory[item.id] = item.clone(item.count)
    }

    if (dayAdded) {
      if (!this._log[dayAdded])
        this._log[dayAdded] = itemsToAdd
      else
        addItemToArr(this._log[dayAdded], ...itemsToAdd)
    }
  }

  /**
   * Cost of items that have to be purchased or counts as an item to be used
   * @param dayAdded - The day that the item was added to the shipping bin
   * @param items - The items to be added to the shipping bin's inventory
   */
  addCost(dayAdded: number, ...items: IItem[]): void {
    const itemsToAdd = [...items]
    for (const item of itemsToAdd) {
      if (this._itemCosts[item.id])
        this._itemCosts[item.id].add(item.count)
      else
        this._itemCosts[item.id] = item.clone(item.count)
    }

    if (dayAdded) {
      if (!this._logCosts[dayAdded])
        this._logCosts[dayAdded] = itemsToAdd
      else
        addItemToArr(this._logCosts[dayAdded], ...itemsToAdd)
    }
  }

  // Items that are left over from the previous day
  addLeftover(dayAdded: number, ...items: IItem[]): void {
    const itemsToAdd = [...items]
    // for (const item of itemsToAdd) {
    //   if (this._inventory[item.id])
    //     this._inventory[item.id].add(item.count)
    //   else
    //     this._inventory[item.id] = item.clone(item.count)
    // }

    if (dayAdded) {
      if (!this._log[dayAdded])
        this._log[dayAdded] = []

      this._log[dayAdded].push(...items)
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
    // include logCosts

    const days = new Set<number>()

    for (const day of Object.keys(this._log))
      days.add(Number.parseInt(day))

    for (const day of Object.keys(this._logCosts))
      days.add(Number.parseInt(day))

    return [...days].sort((a, b) => a - b)
  }

  get logs(): IDayLog[] {
    return this.days.map(day => this.getDayLog(day))
  }

  /**
   * Get the total value of all items in the shipping bin on a given day.
   * @param day - The day to get the value for.
   */
  getDayLog(day: number): IDayLog {
    const items = this._log[day] ?? []
    const itemCosts = this._logCosts[day] ?? []

    let gold = 0

    if (items.length > 0) {
      for (const item of items)
        gold += item.price * item.count
    }

    if (itemCosts.length > 0) {
      for (const item of itemCosts)
        gold -= item.price * item.count
    }

    return {
      day,
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

// Adds an item to an array of items, preventing duplicates
function addItemToArr(arr: IItem[], ...items: IItem[]): void {
  for (const item of items) {
    const index = arr.findIndex(i => i.id === item.id)
    if (index === -1)
      arr.push(item)
    else
      arr[index].add(item.count)
  }
}
