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
    if (tiles.size === 0) {
      this.reset()
      return
    }

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

    const seedsRequiredIdSuffix = options.useStarSeeds ? '-Star' : '-Base'
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

      // Calculate star chance without tile bonuses
      const baseStarChance = 0.25 + (options.useStarSeeds ? 0.25 : 0) + (options.level * 0.02)

      // Base crop yield plus extra crop yield
      const { base } = crop.produceInfo
      const extra = Math.floor(base * 0.5)

      // Factor in tile bonuses
      const finalStarChance = Math.min(1, baseStarChance + (tile.bonuses.includes(Bonus.QualityIncrease) ? 0.5 : 0))
      const hasHarvestBoost = tile.bonuses.includes(Bonus.HarvestIncrease)

      // Calculate number of star and base crops with and without harvest boost
      const baseStarCrops = Math.floor(base * finalStarChance)
      const baseBaseCrops = base - baseStarCrops

      // Extra crops are only calculated if there is a harvest boost
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

      /**
       * An array of days in which the crop is harvestable from moment of planting
       */
      const harvestableDays = crop.getHarvestableDays(options.useGrowthBoost && tile.bonuses.includes(Bonus.SpeedIncrease))

      /**
       * End of cycle and the final day of harvest
       */
      const lastDayOfCycle = harvestableDays[harvestableDays.length - 1]

      // Just a type check
      if (lastDayOfCycle === undefined)
        continue

      let cycles = Math.floor(dayOfLastHarvest / lastDayOfCycle)

      // If we don't include replant, we only need to simulate one cycle
      if (!options.includeReplant)
        cycles = 1

      /**
       *  Days left after harvest time ends but a crop still has an unfinished cycle
       */
      const cycleRemainder = dayOfLastHarvest % lastDayOfCycle

      /**
       * The id of the seeds required for replanting, differentiated by base or star seeds
       */
      const seedsRequiredId = `${crop.type}-${seedsRequiredIdSuffix}` as ICropName

      /**
       * Whether to factor in growth boost for this crop
       */
      const differentiateByGrowthBoost = (options.useGrowthBoost && tile.bonuses.includes(Bonus.SpeedIncrease))

      /**
       * If growth boost is being factored in, we need to differentiate tiles that have growth boost from those that don't.
       * This is to help separate crops of the same type but different cycle times due to growth boost.
       */
      const seedsRequiredIdWithGrowth = (differentiateByGrowthBoost ? `${crop.type}-${options.useStarSeeds ? 'Star' : 'Base'}-Growth` : seedsRequiredId) as ICropNameWithGrowthDiff

      const baseId = (differentiateByGrowthBoost ? `${crop.type}-Base-Growth` : `${crop.type}-Base`) as ICropNameWithGrowthDiff
      const starId = (differentiateByGrowthBoost ? `${crop.type}-Star-Growth` : `${crop.type}-Star`) as ICropNameWithGrowthDiff

      // Now that we've calculated the harvest for one cycle, we simply add the harvest info to all applicable days
      for (let cycle = 1; cycle <= cycles; cycle++) {
        harvestableDays.forEach((day) => {
          const dayInCycle = day * cycle
          const harvestDay = dayHarvests.get(dayInCycle) ?? {
            day: dayInCycle,
            crops: new Map(),
            seedsRequired: new Map(),
          }

          const baseCropYield = harvestDay.crops.get(`${crop.type}-Base`) ?? { base: 0, extra: 0, totalRaw: 0, totalWithDeductions: 0 } as ICropYield
          const starCropYield = harvestDay.crops.get(`${crop.type}-Star`) ?? { base: 0, extra: 0, totalRaw: 0, totalWithDeductions: 0 } as ICropYield

          harvestDay.crops.set(baseId, {
            ...addCropYields(baseCropYield, baseCrop),
            cropType: crop.type,
            isStar: false,
          })

          harvestDay.crops.set(starId, {
            ...addCropYields(starCropYield, starCrop),
            cropType: crop.type,
            isStar: true,
          })

          // Seeds are required only on the last day of the cycle
          if (dayInCycle % lastDayOfCycle === 0) {
            // Marks a day where seeds are needed and how many
            harvestDay.seedsRequired.set(seedsRequiredIdWithGrowth, {
              count: group.count,
              type: crop.type,
            })
          }

          dayHarvests.set(dayInCycle, harvestDay)
        })
      }

      // This cycle won't complete but we still need to harvest the crops on every harvestable day before the last day
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
            isStar: false,
          })

          harvestDay.crops.set(`${crop.type}-Star`, {
            ...starCrop,
            cropType: crop.type,
            isStar: true,
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

    // Sort the harvests by day for chronological calculations
    dayHarvests = new Map([...dayHarvests.entries()].sort(([a], [b]) => a - b))

    /**
     * Contains the remainder of seeds after replanting for the next replant cycle
     */
    const seedsRemainder = new Map() as Map<ICropName, number>

    for (const [, harvest] of dayHarvests) {
      // Deduct seeds required for replanting
      if (options.includeReplantCost) {
        for (const [id, seedsRequiredInfo] of harvest.seedsRequired) {
          // * Uses the id to deduct from the right seed type (base or star)

          const crop = getCropFromType(seedsRequiredInfo.type)
          if (!crop) {
            console.error('Crop not found')
            continue
          }

          const { cropsPerSeed, seedsPerConversion } = crop.conversionInfo

          // Calculate how many seeds need to be produced to replant, factoring in remainder from previous harvests
          const remainingSeeds = seedsRemainder.get(id) ?? 0
          const remainderSeedsToBeUsed = Math.min(remainingSeeds, seedsRequiredInfo.count)
          const seedsRequiredCount = seedsRequiredInfo.count - remainderSeedsToBeUsed

          const conversionsNeeded = Math.ceil(seedsRequiredCount / seedsPerConversion)

          const cropsRequired = conversionsNeeded * cropsPerSeed

          const cropData = harvest.crops.get(id) || {
            base: 0,
            extra: 0,
            totalRaw: 0,
            totalWithDeductions: 0,
            cropType: seedsRequiredInfo.type,
          }

          // Deducts the amount of crops required to convert to seeds
          // ! This method cannot pull from the pool of crops harvested from a plant with growth boost
          // ! if the seedsRequired id comes from a plant without growth boost
          // ! and vice versa
          // * However, since the total inventory of crops is calculated in the end, this might be fine
          harvest.crops.set(id, {
            ...cropData,
            isStar: options.useStarSeeds,
            totalWithDeductions: cropData.totalWithDeductions - cropsRequired,
          })

          // New seeds generated from the crops harvested
          const seedsGenerated = Math.floor(cropsRequired / cropsPerSeed) * seedsPerConversion

          // Remaining seeds after replanting
          const newRemainingSeeds = (remainingSeeds - remainderSeedsToBeUsed) + (seedsGenerated - seedsRequiredCount)

          // Add the harvest to the total harvest
          seedsRemainder.set(id, newRemainingSeeds)
        }
      }

      // Add the day's harvest to the total harvest
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

    // Add the remainder of seeds after last harvest
    if (options.includeReplantCost) {
      for (const [id, seeds] of seedsRemainder) {
        if (seeds === 0) {
          // No need to track seeds that have been used up entirely
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

    Object.freeze(this._dayHarvests)
    Object.freeze(this._totalHarvest.crops)
    Object.freeze(this._totalHarvest.seedsRemainder)
  }

  /**
   * Temporary until the processor is implemented
   */
  // get asInventory(): IInventory {
  //   const inventory: IInventory = {}

  //   inventory.crop = {}
  //   for (const [cropId, cropYield] of this.totalHarvest.crops) {
  //     const crop = cropYield.cropType
  //     const isStar = (cropId.includes('Star'))
  //     const cropInfo = getCropFromType(crop)
  //     if (!cropInfo) {
  //       console.error('Crop not found')
  //       continue
  //     }

  //     if (cropYield.totalWithDeductions <= 0)
  //       continue

  //     const item: IInventoryItem = {
  //       count: cropYield.totalWithDeductions,
  //       img: {
  //         src: cropInfo.image,
  //         alt: cropInfo.type,
  //       },
  //       isStar,
  //       baseGoldValue: isStar ? cropInfo.goldValues.cropStar : cropInfo.goldValues.crop,
  //     }

  //     inventory.crop[cropId] = item
  //   }

  //   return inventory
  // }
}

function addCropYields(cropYield1: ICropYield, cropYield2: ICropYield): ICropYield {
  return {
    base: cropYield1.base + cropYield2.base,
    extra: cropYield1.extra + cropYield2.extra,
    totalRaw: cropYield1.totalRaw + cropYield2.totalRaw,
    totalWithDeductions: cropYield1.totalWithDeductions + cropYield2.totalWithDeductions,
  } satisfies ICropYield
}

/**
 * @param cropTiles - A map of crop groups
 * @returns The highest growth time of all crops
 */
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

/**
 * @param crops - A map of crop groups
 * @returns The least common multiple of all growth times of the crops
 */
function getGrowthTimeLCM(crops: TUniqueTiles): number {
  if (crops.size === 0) {
    // console.warn('No crops found')
    return 0
  }

  const growthTimes = new Set<number>()
  for (const group of crops.values()) {
    const tile = group.tile
    if (!tile.crop)
      continue

    growthTimes.add(tile.crop.getTotalGrowTime())
  }

  if (growthTimes.size === 0) {
    // console.warn('No growth times found')
    return 0
  }

  return Array.from(growthTimes).reduce((acc, cur) => (acc * cur) / getGCD(acc, cur))
}

/**
 * Utility function for getGrowthTimeLCM
 * @returns The greatest common divisor of two numbers
 */
function getGCD(a: number, b: number): number {
  return b === 0 ? a : getGCD(b, a % b)
}
