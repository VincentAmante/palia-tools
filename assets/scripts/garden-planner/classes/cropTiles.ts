import CropType from '../enums/crops'
import FertiliserType from '../enums/fertiliser'
import Bonus from '../enums/bonus'
import type Tile from './tile'
import type Plot from './plot'

// Stores information about the tiles
export default class CropTiles {
  private _individualCrops: Map<string, Tile>
  private _fertiliserCount: Record<string, number>
  private _bonusCoverage: Record<string, number>
  private _cropTypeCount: Record<string, number>

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

    for (const crop of this._individualCrops.values()) {
      for (const bonus of crop.bonuses) {
        if (bonus !== Bonus.None)
          this._bonusCoverage[bonus]++
      }

      if (crop.crop && crop.crop.type !== CropType.None)
        this._cropTypeCount[crop.crop.type as CropType]++
    }
  }

  get individualCrops(): Map<string, Tile> {
    return this._individualCrops
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
