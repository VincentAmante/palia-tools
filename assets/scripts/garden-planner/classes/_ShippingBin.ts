/**
 * ShippingBin class
 * - This class will be used in the future to store data about items being sold
 */

import type { Item } from './items/_item'

export interface IBinInfo {
  [day: string]: Record<string, Item>
}

export class ShippingBin {
  private _binInfo: IBinInfo = {}

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
     * I've considered making it so that the player is limited in how much they
     *  can sell in a day based on item stack size (as there's a limited amount of slots)
     *  but I think it's better to just let the player figure out how to manage their shipping bin
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
