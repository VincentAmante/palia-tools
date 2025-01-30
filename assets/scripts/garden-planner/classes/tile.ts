import uniqid from 'uniqid'
import Bonus from '../enums/bonus'
import type Crop from './crop'
import type Fertiliser from './fertiliser'

class Tile {
  /**
   * {crop} - the crop currently planted on this tile. If no crop is planted, it will be null.
   */
  private _crop: Crop | null = null

  /**
   * @type {Bonus[]} - an array of unique bonuses that have been received by this tile.
   */

  private _bonuses: Bonus[] = []

  /**
   * {bonusesReceived} - unlike {bonuses} - track how many sources of a bonus a tile has.
   *  Used for multi-tile crops, which requires multiple sources around the crop for a Bonus to be applied.
   * @type {Bonus[]} - an array of bonuses that have been received by this tile, including duplicates
   */
  private _bonusesReceived: Bonus[] = []

  /**
   * Unique identifier for the tile, generated using `uniqid` from the 'uniqid' package.
   */
  private _id: string = uniqid()

  /**
   * Fertiliser applied to the tile, which applies a bonus to the tile.
   */
  private _fertiliser: Fertiliser | null = null

  /**
   * Meant to track whether a tile has been hovered over or not.
   * Used for hover effects and animations.
   */
  private _isHovered: boolean = false

  /**
   * @deprecated Unused property meant to store individual seed quality for each tile.
   * Currently all tiles have the same seed quality.
   */
  private _hasStarSeed: boolean = false

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

  /**
   * @returns The current crop on this tile. If there is no crop, returns null.
   */
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

  /**
   * @returns The bonus of the crop on this tile. If there is no crop, returns None.
   */
  getCropBonus(): Bonus {
    if (this._crop)
      return this._crop.cropBonus as Bonus

    return Bonus.None
  }

  /**
   * Sets the bonuses applicated to the crop on this tile
   * @param bonuses The bonuses to apply. If a bonus is already applied, it will not be added again.
   */
  set bonuses(bonuses: Bonus[]) {
    this._bonuses = [...new Set(bonuses)]
  }

  /**
   * @returns Unique bonuses received by the crop on this tile. If there is no crop, returns None.
   * @see Tile._bonuses
   */
  get bonuses(): Bonus[] {
    return this._bonuses
  }

  /**
   * @returns The bonuses received by the crop. If there is no crop, returns None.
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

  // get hasStarSeed(): boolean {
  //   return this._hasStarSeed
  // }

  // set hasStarSeed(hasStarSeed: boolean) {
  //   this._hasStarSeed = hasStarSeed
  // }
}

export default Tile
