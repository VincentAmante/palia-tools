import uniqid from 'uniqid'
import Bonus from '../enums/bonus'
import type Crop from './Crop'
import type Fertiliser from './Fertiliser'

class Tile {
  private _crop: Crop | null = null
  private _bonuses: Bonus[] = []
  private _bonusesReceived: Bonus[] = []
  private _id: string = uniqid()
  private _hasStarSeed: boolean = false
  private _fertiliser: Fertiliser | null = null
  private _isHovered: boolean = false

  constructor(crop: Crop | null) {
    this._crop = crop
  }

  set id(id: string) {
    this._id = id
  }

  get id(): string {
    return this._id
  }

  get isHovered(): boolean {
    return this._isHovered
  }

  set isHovered(isHovered: boolean) {
    this._isHovered = isHovered
  }

  get crop(): Crop | null {
    return this._crop
  }

  set crop(crop: Crop | null) {
    this._crop = crop
  }

  get fertiliser(): Fertiliser | null {
    return this._fertiliser
  }

  set fertiliser(fertiliser: Fertiliser | null) {
    this._fertiliser = fertiliser
  }

  getCropBonus(): Bonus {
    if (this._crop)
      return this._crop.cropBonus as Bonus

    return Bonus.None
  }

  set bonuses(bonuses: Bonus[]) {
    this._bonuses = [...new Set(bonuses)]
  }

  get bonuses(): Bonus[] {
    return this._bonuses
  }

  /**
   * {bonusesReceived} - unlike {bonuses} - track how many sources of a bonus a tile has
   *  This is used for bushes/trees, which requires multiple sources to apply a bonus,
   *  regardless of whether those sources are on the same tile
   */
  get bonusesReceived(): Bonus[] {
    return this._bonusesReceived
  }

  set bonusesReceived(bonuses: Bonus[]) {
    this._bonusesReceived = bonuses
  }

  hasBonus(bonus: Bonus): boolean {
    return this._bonuses.includes(bonus)
  }

  get hasStarSeed(): boolean {
    return this._hasStarSeed
  }

  set hasStarSeed(hasStarSeed: boolean) {
    this._hasStarSeed = hasStarSeed
  }
}

export default Tile
