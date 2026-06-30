import CropType from '../enums/crops'
import FertiliserType from '../enums/fertiliser'
import Bonus from '../enums/bonus'
import type { TCropTiles, TUniqueTiles } from '../utils/garden-helpers'
import type Tile from './tile'
import type Plot from './plot'
import type { ITile } from './tile'


type CropGroupBonusStats = Record<Bonus, number>
// Stores information about the tiles
export default class CropTiles {
  private _individualCrops: TCropTiles
  private _fertiliserCount: Record<string, number>
  private _bonusCoverage: Record<string, number>
  private _cropTypeCount: Record<string, number>
  private _cropGroupStats: Map<CropType, CropGroupBonusStats>

  // Unique crops have the same crop type and bonuses
  private _uniqueTiles: TUniqueTiles

  constructor() {
    this._individualCrops = new Map()
    this._fertiliserCount = this.initialiseCounts(FertiliserType)
    this._bonusCoverage = this.initialiseCounts(Bonus)
    this._cropTypeCount = this.initialiseCounts(CropType)
    this._uniqueTiles = new Map()
    this._cropGroupStats = new Map<CropType, CropGroupBonusStats>()
  }

  updateTiles(layout: Plot[][]) {
    // Reset the values
    this._individualCrops = new Map<string, ITile>()
    this._fertiliserCount = this.initialiseCounts(FertiliserType)
    this._bonusCoverage = this.initialiseCounts(Bonus)
    this._cropTypeCount = this.initialiseCounts(CropType)
    this._uniqueTiles = new Map()
    this._cropGroupStats = new Map<CropType, CropGroupBonusStats>()

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

        if (this._cropGroupStats.has(tile.crop.type)) {
          const cropGroupStats = this._cropGroupStats.get(tile.crop.type)!

          for (const bonus of tile.bonuses) {
            cropGroupStats[bonus]++
          }
        } else {
          const cropGroupStats: Record<Bonus, number> = this.initialiseCounts(Bonus)

          
          for (const bonus of tile.bonuses) {
            cropGroupStats[bonus]++
          }

          this._cropGroupStats.set(tile.crop.type, cropGroupStats)
        }
      }
    }
  }

  get individualCrops(): Map<string, ITile> {
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

  get cropGroupBonusStats(): Map<CropType, CropGroupBonusStats> {
    return this._cropGroupStats
  }

  private initialiseCounts<T extends string>(enumType: Record<string, T>): Record<T, number> {
    return Object.fromEntries(
      Object.values(enumType).map(value => [value, 0])
    ) as Record<T, number>
  }
}
