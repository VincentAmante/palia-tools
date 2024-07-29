import { Bonus, CropType, getCropFromType } from '../imports'

import type { DayHarvests, ICropName, ICropNameWithGrowthDiff, ICropYield, ITotalHarvest, TUniqueTiles } from '../utils/garden-helpers'

export interface IHarvesterOptions {
  days: number | 'L' | 'M'
  includeReplant: boolean
  useStarSeeds: boolean
  includeReplantCost: boolean
  useGrowthBoost: boolean
  level: number
}

/**
 * The Harvester class is responsible for simulating the yield of crops over a given number of days.
 *
 */
export default class Harvester {
  private _dayHarvests: DayHarvests = new Map()
  private _totalHarvest: ITotalHarvest = {
    lastHarvestDay: 0,
    crops: new Map(),
    seedsRemainder: new Map(),
  }

  get dayHarvests(): DayHarvests {
    return this._dayHarvests
  }

  get totalHarvest(): ITotalHarvest {
    return this._totalHarvest
  }

  constructor() {
    this._totalHarvest = {
      lastHarvestDay: 0,
      crops: new Map(),
      seedsRemainder: new Map(),
    }
  }

  private reset(): void {
    this._dayHarvests.clear()
    this._totalHarvest = {
      lastHarvestDay: 0,
      crops: new Map(),
      seedsRemainder: new Map(),
    }
  }

  simulateYield(tiles: TUniqueTiles, options: IHarvesterOptions): void {
    if (tiles.size === 0)
      return

    this.reset()
    let dayOfLastHarvest = 0

    switch (options.days) {
      // This fetches the day in which all crops are harvestable
      case -1:
      case 'L':
        dayOfLastHarvest = getGrowthTimeLCM(tiles)
        break

      // This uses the day in which the crop with the highest growth time is harvestable
      case 0:
      case 'M':
        dayOfLastHarvest = getHighestGrowthTime(tiles)
        break

      // Manual input
      default:
        dayOfLastHarvest = options.days
    }

    let dayHarvests = new Map() as DayHarvests

    /**
     * For each crop, calculate the harvest once and then apply the harvest to each day.
     * This is faster than the old method of calculating the harvest for each day,
     * which was redundant because the harvest is the same for each day outside of seed deductions.
     */
    for (const [, group] of tiles) {
      const tile = group.tile
      if (!tile.crop)
        continue

      const crop = tile.crop

      if (crop.produceInfo === null || crop.type === CropType.None)
        continue

      const baseStarChance = 0.25 + (options.useStarSeeds ? 0.25 : 0) + (options.level * 0.02)

      const { base } = crop.produceInfo
      const extra = Math.floor(base * 0.5)

      const finalStarChance = Math.min(1, baseStarChance + (tile.bonuses.includes(Bonus.QualityIncrease) ? 0.5 : 0))
      const hasHarvestBoost = tile.bonuses.includes(Bonus.HarvestIncrease)

      const baseStarCrops = Math.floor(base * finalStarChance)
      const baseBaseCrops = base - baseStarCrops

      const extraStarCrops = (hasHarvestBoost) ? Math.floor(extra * finalStarChance) : 0
      const extraBaseCrops = (hasHarvestBoost) ? extra - extraStarCrops : 0

      const totalStarCrops = baseStarCrops + extraStarCrops
      const totalBaseCrops = baseBaseCrops + extraBaseCrops

      // Stores the number of crops harvested, which is usually the same
      const starCrop = {
        base: baseStarCrops * group.count,
        extra: extraStarCrops * group.count,
        totalRaw: totalStarCrops * group.count,
        totalWithDeductions: totalStarCrops * group.count,
      } satisfies ICropYield
      const baseCrop = {
        base: baseBaseCrops * group.count,
        extra: extraBaseCrops * group.count,
        totalRaw: totalBaseCrops * group.count,
        totalWithDeductions: totalBaseCrops * group.count,
      } satisfies ICropYield

      const harvestableDays = crop.getHarvestableDays(options.useGrowthBoost && tile.bonuses.includes(Bonus.SpeedIncrease))
      const lastDayOfCycle = harvestableDays[harvestableDays.length - 1]
      if (lastDayOfCycle === undefined)
        continue

      let cycles = Math.floor(dayOfLastHarvest / lastDayOfCycle)

      // If we don't include replant, we only need to simulate one cycle
      if (!options.includeReplant)
        cycles = 1

      const cycleRemainder = dayOfLastHarvest % lastDayOfCycle
      const seedsRequiredId = `${crop.type}-${options.useStarSeeds ? 'Star' : 'Base'}` as ICropName

      const differentiateByGrowthBoost = (options.useGrowthBoost && tile.bonuses.includes(Bonus.SpeedIncrease))

      // if growth boost is being factored in, we need to differentiate tiles that have growth boost from those that don't
      const seedsRequiredIdWithGrowth = (differentiateByGrowthBoost ? `${crop.type}-${options.useStarSeeds ? 'Star' : 'Base'}-Growth` : seedsRequiredId) as ICropNameWithGrowthDiff
      const baseId = (differentiateByGrowthBoost ? `${crop.type}-Base-Growth` : `${crop.type}-Base`) as ICropNameWithGrowthDiff
      const starId = (differentiateByGrowthBoost ? `${crop.type}-Star-Growth` : `${crop.type}-Star`) as ICropNameWithGrowthDiff

      for (let cycle = 1; cycle <= cycles; cycle++) {
        harvestableDays.forEach((day) => {
          const dayInCycle = day * cycle
          const harvestDay = dayHarvests.get(dayInCycle) ?? { day: dayInCycle, crops: new Map(), seedsRequired: new Map() }

          const baseCropYield = harvestDay.crops.get(`${crop.type}-Base`) ?? { base: 0, extra: 0, totalRaw: 0, totalWithDeductions: 0 } as ICropYield
          const starCropYield = harvestDay.crops.get(`${crop.type}-Star`) ?? { base: 0, extra: 0, totalRaw: 0, totalWithDeductions: 0 } as ICropYield

          harvestDay.crops.set(baseId, {
            ...addCropYields(baseCropYield, baseCrop),
            cropType: crop.type,
            isStar: options.useStarSeeds,
          })

          harvestDay.crops.set(starId, {
            ...addCropYields(starCropYield, starCrop),
            cropType: crop.type,
            isStar: options.useStarSeeds,
          })

          // apply seeds required only on last day of cycle
          if (dayInCycle % lastDayOfCycle === 0) {
            harvestDay.seedsRequired.set(seedsRequiredIdWithGrowth, {
              count: group.count,
              type: crop.type,
            })
          }

          dayHarvests.set(dayInCycle, harvestDay)
          // Add the remainder of the last cycle
        })
      }

      // Add the remainder of the last cycle
      if (cycleRemainder > 0) {
        for (const day of harvestableDays) {
          const dayInCycle = lastDayOfCycle * cycles + day
          if (dayInCycle > dayOfLastHarvest)
            break

          const harvestDay = dayHarvests.get(dayInCycle) ?? {
            day: dayInCycle,
            crops: new Map(),
            seedsRequired: new Map(),
          }

          harvestDay.crops.set(`${crop.type}-Base`, {
            ...baseCrop,
            cropType: crop.type,
            isStar: options.useStarSeeds,
          })

          harvestDay.crops.set(`${crop.type}-Star`, {
            ...starCrop,
            cropType: crop.type,
            isStar: options.useStarSeeds,
          })

          if (dayInCycle % lastDayOfCycle === 0) {
            harvestDay.seedsRequired.set(seedsRequiredIdWithGrowth, {
              count: group.count,
              type: crop.type,
            })
          }

          dayHarvests.set(dayInCycle, harvestDay)
        }
      }
    }

    dayHarvests = new Map([...dayHarvests.entries()].sort(([a], [b]) => a - b))
    const seedsRemainder = new Map() as Map<ICropName, number>

    for (const [, harvest] of dayHarvests) {
      if (options.includeReplantCost) {
        for (const seedsRequired of harvest.seedsRequired) {
          const id = seedsRequired[0]
          const crop = getCropFromType(seedsRequired[1].type)
          if (!crop) {
            console.error('Crop not found')
            continue
          }

          const { cropsPerSeed, seedsPerConversion } = crop.conversionInfo

          const remainingSeeds = seedsRemainder.get(id) ?? 0
          const remainderSeedsToBeUsed = Math.min(remainingSeeds, seedsRequired[1].count)
          const seedsRequiredCount = seedsRequired[1].count - remainderSeedsToBeUsed
          const conversionsNeeded = Math.ceil(seedsRequiredCount / seedsPerConversion)
          const cropsRequired = conversionsNeeded * cropsPerSeed
          harvest.crops.set(id, {
            ...harvest.crops.get(id)!,
            totalWithDeductions: harvest.crops.get(id)!.totalWithDeductions - cropsRequired,
          })
          const seedsGenerated = Math.floor(cropsRequired / cropsPerSeed) * seedsPerConversion
          const newRemainingSeeds = (remainingSeeds - remainderSeedsToBeUsed) + (seedsGenerated - seedsRequiredCount)

          // Add the harvest to the total harvest
          seedsRemainder.set(id, newRemainingSeeds)
        }
      }

      // Add the harvest to the total harvest
      for (const [cropId, cropYield] of harvest.crops) {
        const crop = cropYield.cropType
        const isStar = cropYield.isStar
        const total = this._totalHarvest.crops.get(cropId) ?? {
          base: 0,
          extra: 0,
          totalRaw: 0,
          totalWithDeductions: 0,
        } satisfies ICropYield
        this._totalHarvest.crops.set(cropId, {
          ...addCropYields(total, cropYield),
          cropType: crop,
          isStar,
        })
      }
    }

    if (options.includeReplantCost) {
      for (const [id, seeds] of seedsRemainder) {
        if (seeds === 0) {
          this.totalHarvest.seedsRemainder.delete(id)
        }
        else {
          this.totalHarvest.seedsRemainder.set(id, {
            count: seeds,
            type: id.split('-')[0] as CropType,
          })
        }
      }
    }

    this._dayHarvests = dayHarvests
    this._totalHarvest.lastHarvestDay = dayOfLastHarvest

    // Freeze the objects to prevent modification
    // Object.freeze(this._dayHarvests)
    // Object.freeze(this._totalHarvest)
  }
}

function addCropYields(cropYield1: ICropYield, cropYield2: ICropYield): ICropYield {
  return {
    base: cropYield1.base + cropYield2.base,
    extra: cropYield1.extra + cropYield2.extra,
    totalRaw: cropYield1.totalRaw + cropYield2.totalRaw,
    totalWithDeductions: cropYield1.totalWithDeductions + cropYield2.totalWithDeductions,
  } satisfies ICropYield
}

function getHighestGrowthTime(cropTiles: TUniqueTiles): number {
  let highestGrowthTime = 0
  for (const group of cropTiles.values()) {
    const crop = group.tile.crop
    if (!crop)
      continue

    const totalGrowthTime = crop.getTotalGrowTime()
    if (totalGrowthTime > highestGrowthTime)
      highestGrowthTime = totalGrowthTime
  }

  return highestGrowthTime
}

// Find the least common multiple of all growth times
function getGrowthTimeLCM(crops: TUniqueTiles): number {
  const growthTimes = new Set<number>()
  for (const group of crops.values()) {
    const tile = group.tile
    if (!tile.crop)
      continue

    growthTimes.add(tile.crop.getTotalGrowTime())
  }

  return Array.from(growthTimes).reduce((acc, cur) => (acc * cur) / getGCD(acc, cur))
}

function getGCD(a: number, b: number): number {
  return b === 0 ? a : getGCD(b, a % b)
}
