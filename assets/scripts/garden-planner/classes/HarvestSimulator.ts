import { CropType } from '../imports'
import Bonus from '../enums/bonus'
import crops from '../cropList'
import type { HarvestInventory, HarvestSimulatorLog } from '../utils/gardenHelpers'
import type Tile from './Tile'

interface HarvestSimulatorOptions {
  days: number
  includeReplant: boolean
  level: number
  includeReplantCost: boolean
  useGrowthBoost: boolean
  useStarSeeds: boolean
}

interface CropYield {
  base: number
  star: number
}

export interface IHarvestSimulator {
  options: HarvestSimulatorOptions
  simulate(cropTiles: Tile[]): {
    harvestLog: HarvestSimulatorLog[]
    harvestInventory: HarvestInventory
    lastDay: number
  }
}

/**
 * A class to handle the simulation of a garden harvest over the course of a given number of days.
 */
export default class HarvestSimulator implements IHarvestSimulator {
  private _options: HarvestSimulatorOptions = {
    days: 0,
    includeReplant: false,
    level: 0,
    includeReplantCost: false,
    useGrowthBoost: false,
    useStarSeeds: false,
  }

  constructor(options: {
    days?: number
    includeReplant?: boolean
    postLevel25?: boolean
    includeReplantCost?: boolean
    useGrowthBoost?: boolean
    level?: number
  } = {}) {
    this._options = {
      ...this._options,
      ...options,
    }
  }

  get options(): HarvestSimulatorOptions {
    return this._options
  }

  set options(options: HarvestSimulatorOptions) {
    this._options = {
      ...this._options,
      ...options,
    }
  }

  simulate(cropTiles: Tile[]): {
    harvestLog: HarvestSimulatorLog[]
    harvestInventory: HarvestInventory
    lastDay: number
  } {
    const log: HarvestSimulatorLog[] = []
    const inventory: HarvestInventory = {
      crops: getCropMap(),
      seedsLeft: getCropMap(),
    }
    let lastDay = 0

    if (cropTiles.length === 0) {
      return {
        harvestLog: log,
        harvestInventory: inventory,
        lastDay,
      }
    }

    const options = this._options
    const days
      = (options.days && options.days > 0)
        ? options.days
        : getHighestGrowTime(cropTiles, options.useGrowthBoost)

    // TODO: verify this again
    const baseStarChance = 0.25 + (options.useStarSeeds ? 0.25 : 0) + (options.level * 0.02)
    const tilesData: Record<string, {
      hasGrowthBoost: boolean
      growTime: number
      harvestDays: number[]
      increase: CropYield
    }> = {}

    // Precompute data for each tile that isn't dependent on the day
    cropTiles.forEach((tile) => {
      const crop = tile.crop

      if (!crop)
        return
      if (crop.produceInfo === null || crop.type === CropType.None || crop.produceInfo.growthTime === null)
        return

      const hasGrowthBoost = options.useGrowthBoost && tile.bonuses.includes(Bonus.SpeedIncrease)
      const growTime = crop.getTotalGrowTime(hasGrowthBoost)
      const harvestDays = crop.getHarvestDays(hasGrowthBoost)

      const starChance = Math.min(1, baseStarChance + (tile.bonuses.includes(Bonus.QualityIncrease) ? 0.25 : 0))
      const { base, withBonus } = crop.produceInfo
      const hasHarvestBonus = tile.bonuses.includes(Bonus.HarvestIncrease)
      const starCrops = Math.round(starChance * (hasHarvestBonus ? withBonus : base))
      const baseCrops = hasHarvestBonus ? withBonus - starCrops : base - starCrops

      tilesData[tile.id] = {
        hasGrowthBoost,
        growTime,
        harvestDays,
        increase: {
          base: baseCrops,
          star: starCrops,
        },
      }
    })

    for (let day = 1; day <= days; day++) {
      const dayHarvest: HarvestSimulatorLog = {
        day,
        crops: getCropMap(),
        seedsRemainder: getCropMap(),
      }

      cropTiles.forEach((tile) => {
        const crop = tile.crop

        if (!crop
          || crop.produceInfo === null
          || crop.type === CropType.None
          || crop.produceInfo.growthTime === null)
          return

        const tileData = tilesData[tile.id]
        const growTime = tileData.growTime
        if (day > growTime && !options.includeReplant)
          return

        const harvestDays = tileData.harvestDays

        if (harvestDays.length === 0)
          return

        const isHarvestable = harvestDays.includes(day % growTime) || (day >= growTime && day % growTime === 0)
        const doReplant = options.includeReplant && (day % growTime === 0)

        if (isHarvestable) {
          dayHarvest.crops[crop.type].base += tileData.increase.base
          dayHarvest.crops[crop.type].star += tileData.increase.star

          if (doReplant) {
            if (options.useStarSeeds)
              dayHarvest.seedsRemainder[crop.type].star++
            else
              dayHarvest.seedsRemainder[crop.type].base++
          }
        }
      })

      const hasCrop = Object.values(dayHarvest.crops).some(cropYield => cropYield.base > 0 || cropYield.star > 0)
      if (hasCrop)
        log.push(dayHarvest)

      if (options.includeReplantCost && hasCrop) {
        Object.entries(dayHarvest.seedsRemainder)
          .forEach(([cropType, cropYield]: [string, CropYield]) => {
            const crop = crops[cropType as CropType]

            if (crop == null)
              return

            const seeds = cropYield
            const { cropsPerSeed, seedsPerConversion } = crop.conversionInfo
            const seedsRemainder = inventory.seedsLeft

            if (seeds.star > 0) {
              const seedsToProduce = Math.max(0, (seeds.star - seedsRemainder[cropType as CropType].star))
              if (seedsToProduce > 0) {
                const cropsConsumed = Math.max(Math.ceil((cropsPerSeed / seedsPerConversion) * seedsToProduce), cropsPerSeed)
                dayHarvest.crops[cropType as CropType].star -= cropsConsumed
                const seedsProduced = Math.floor((cropsConsumed / cropsPerSeed) * seedsPerConversion)
                seedsRemainder[cropType as CropType].star
                  += Math.floor(seedsProduced - seedsToProduce)
              }

              const remainderSeedsToBeUsed = seeds.star - seedsToProduce
              seedsRemainder[cropType as CropType].star -= remainderSeedsToBeUsed
              cropYield.star = seedsRemainder[cropType as CropType].star
            }
          })
      }
    }

    log.forEach((dayLog) => {
      Object.entries(dayLog.crops).forEach(([cropType, cropYield]: [string, CropYield]) => {
        inventory.crops[cropType as CropType].base += cropYield.base
        inventory.crops[cropType as CropType].star += cropYield.star
      })
      lastDay = Math.max(lastDay, dayLog.day)
    })
    return {
      harvestLog: log,
      harvestInventory: inventory,
      lastDay,
    }
  }
}

/**
 * Calculates the highest grow time among the given tiles.
 *
 * @param tiles - The array of tiles to calculate the grow time from.
 * @param useGrowthBoost - A boolean indicating whether to use growth boost or not.
 * @returns The highest grow time among the tiles.
 */
function getHighestGrowTime(
  tiles: Tile[],
  useGrowthBoost: boolean,
) {
  let maxGrowthTime = 0
  tiles.forEach((tile) => {
    if (!tile.crop?.produceInfo)
      return
    const growTime = tile.crop.getTotalGrowTime(useGrowthBoost && tile.bonuses.includes(Bonus.SpeedIncrease))
    if (growTime > maxGrowthTime)
      maxGrowthTime = growTime
  })
  return maxGrowthTime
}

/**
 * Retrieves a crop map to store an inventory of any value by crop type and quality.
 * @returns The crop map object.
 */
function getCropMap() {
  const cropMap: Record<CropType, {
    base: number
    star: number
  }> = {} as Record<CropType, {
    base: number
    star: number
  }>
  for (const cropType of Object.values(CropType)) {
    cropMap[cropType] = {
      base: 0,
      star: 0,
    }
  }
  return cropMap
}
