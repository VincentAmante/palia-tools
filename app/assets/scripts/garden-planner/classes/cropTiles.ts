import CropType from '../enums/crops'
import FertiliserType from '../enums/fertiliser'
import Bonus from '../enums/bonus'
import type { TCropTiles, TUniqueTiles } from '../utils/garden-helpers'
import type Tile from './tile'
import type Plot from './plot'

// Stores information about the tiles
export default class CropTiles {
  private _individualCrops: TCropTiles
  private _fertiliserCount: Record<string, number>
  private _bonusCoverage: Record<string, number>
  private _cropTypeCount: Record<string, number>

  // Unique crops have the same crop type and bonuses
  private _uniqueTiles: TUniqueTiles

  constructor() {
    this._individualCrops = new Map()
    this._fertiliserCount = Object.fromEntries(
      Object.values(FertiliserType).map(fertiliserType => [fertiliserType, 0]),
    )
    this._bonusCoverage = Object.fromEntries(
      Object.values(Bonus).map(bonus => [bonus, 0]),
    )
    this._cropTypeCount = Object.fromEntries(
      Object.values(CropType).map(cropType => [cropType, 0]),
    )
    this._uniqueTiles = new Map()
  }

  updateTiles(layout: Plot[][]) {
    // Reset the values
    this._individualCrops = new Map<string, Tile>()
    this._fertiliserCount = Object.fromEntries(
      Object.values(FertiliserType).map(fertiliserType => [fertiliserType, 0]),
    )
    this._bonusCoverage = Object.fromEntries(
      Object.values(Bonus).map(bonus => [bonus, 0]),
    )
    this._cropTypeCount = Object.fromEntries(
      Object.values(CropType).map(cropType => [cropType, 0]),
    )
    this._uniqueTiles = new Map()

    for (const plot of layout.flat()) {
      if (!plot.isActive)
        continue
      for (const tile of plot.tiles.flat()) {
        if (tile.fertiliser && tile.fertiliser.type !== FertiliserType.None)
          this._fertiliserCount[tile.fertiliser.type]++
        if (tile.crop && tile.crop.type !== CropType.None)
          this._individualCrops.set(tile.id, tile)
      }
    }

    for (const tile of this._individualCrops.values()) {
      for (const bonus of tile.bonuses) {
        if (bonus !== Bonus.None)
          this._bonusCoverage[bonus]++
      }

      if (tile.crop && tile.crop.type !== CropType.None) {
        this._cropTypeCount[tile.crop.type as CropType]++

        // sort bonuses by name to ensure unique key for
        // crops with the same type and bonuses
        const bonusesFiltered = tile.bonuses.filter(bonus => bonus !== Bonus.WaterRetain && bonus !== Bonus.WeedPrevention)
        const bonusesString = bonusesFiltered.sort().join('-')
        // No need to include water retain and weed prevention for unique crops
        const key = `${tile.crop.type}-${bonusesString}`
        if (this._uniqueTiles.has(key)) {
          this._uniqueTiles.get(key)!.count++
        }
        else {
          this._uniqueTiles.set(key, {
            tile,
            count: 1,
          })
        }
      }
    }
  }

  get individualCrops(): Map<string, Tile> {
    return this._individualCrops
  }

  get uniqueTiles(): TUniqueTiles {
    return this._uniqueTiles
  }

  get fertiliserCount(): Record<string, number> {
    return this._fertiliserCount
  }

  get bonusCoverage(): Record<string, number> {
    return this._bonusCoverage
  }

  get cropTypeCount(): Record<string, number> {
    return this._cropTypeCount
  }

  get cropCount(): number {
    return this._individualCrops.size
  }
}
