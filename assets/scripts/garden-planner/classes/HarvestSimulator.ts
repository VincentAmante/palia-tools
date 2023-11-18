import { CropType } from '../imports'
import Bonus from '../enums/bonus'
import crops from '../crop-list'
import type Tile from './Tile'

interface HarvestSimulatorOptions {
  days: number
  includeReplant: boolean
  level: number
  postLevel25: boolean
  includeReplantCost: boolean
  useGrowthBoost: boolean
  useStarSeeds: boolean
}

interface CropYield {
  base: number
  star: number
}

interface HarvestSimulatorLog {
  day: number
  crops: Record<CropType, CropYield>
  seedsRemainder: Record<CropType, CropYield>
}

interface HarvestInventory {
  crops: Record<CropType, {
    base: number
    star: number
  }>
  seedsLeft: Record<CropType, {
    base: number
    star: number
  }>
}

export default class HarvestSimulator {
  private _options: HarvestSimulatorOptions = {
    days: 0,
    includeReplant: false,
    level: 0,
    postLevel25: false,
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
        : getMaxGrowTime(cropTiles, options.useGrowthBoost)

    // Day by day simulation
    // const cropsMemory: Record<string, CropYield> = {}

    // 25% base chance, +25% if using star seeds, +2% per level
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

        const isHarvestable = tileData.harvestDays.includes(day)
        const doReplant = day % tileData.harvestDays[tileData.harvestDays.length - 1] === 0

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

function getMaxGrowTime(
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