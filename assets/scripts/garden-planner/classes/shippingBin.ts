import type { Item } from './items/item'

export interface IBinInfo {
  [day: string]: Record<string, Item>
}

/**
 * ShippingBin class
 * - Used to store information on items to be sold
 */
export class ShippingBin {
  private _binInfo: IBinInfo = {}

  /**
   * Sorts the bin by day
   */
  sortBin() {
    const sortedBin: IBinInfo = {}
    Object.keys(this._binInfo).sort((a, b) => {
      const dayA = Number.parseInt(a)
      const dayB = Number.parseInt(b)
      if (dayA < dayB)
        return -1
      if (dayA > dayB)
        return 1
      return 0
    }).forEach((key) => {
      sortedBin[key] = this._binInfo[key]
    })
    this._binInfo = sortedBin
  }

  get binInfo(): IBinInfo {
    return this._binInfo
  }

  add(day: string, item: Item): void {
    /**
     * Considerations were made to limit based on stack size,
     * but it'll be ignored for now so that the output is more compact.
     */
    const id = `${item.name}:${(item.isStar) ? 'star' : 'normal'}`

    if (!this._binInfo[day])
      this._binInfo[day] = {}
    if (!this._binInfo[day][id])
      this._binInfo[day][id] = item
    else
      this._binInfo[day][id].add(item.count)
  }
}
