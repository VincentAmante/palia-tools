import type { Item } from './items/item'

export interface IInventoryInfo {
  [day: string]: Record<string, Item>
}

/**
 * ShippingBin class
 * - Used to store information on items in inventory, including their selling price
 */
export class Inventory {
  private _inventoryInfo: IInventoryInfo = {}

  /**
   * Sorts the bin by day
   */
  sortBin() {
    const sortedInventory: IInventoryInfo = {}
    Object.keys(this._inventoryInfo).sort((a, b) => {
      const dayA = Number.parseInt(a)
      const dayB = Number.parseInt(b)
      if (dayA < dayB)
        return -1
      if (dayA > dayB)
        return 1
      return 0
    }).forEach((key) => {
      sortedInventory[key] = this._inventoryInfo[key]
    })
    this._inventoryInfo = sortedInventory
  }

  get inventoryInfo(): IInventoryInfo {
    return this._inventoryInfo
  }

  add(day: string, item: Item): void {
    /**
     * Considerations were made to limit based on stack size,
     * but it'll be ignored for now so that the output is more compact.
     */
    const id = `${item.name}:${(item.isStar) ? 'star' : 'normal'}`

    if (!this._inventoryInfo[day])
      this._inventoryInfo[day] = {}
    if (!this._inventoryInfo[day][id])
      this._inventoryInfo[day][id] = item
    else
      this._inventoryInfo[day][id].add(item.count)
  }
}
