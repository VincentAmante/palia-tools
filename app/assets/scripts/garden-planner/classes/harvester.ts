import { Bonus, CropType, getCropFromType } from '../imports'

import type { DayHarvests, ICropHarvestCycle, ICropName, ICropNameWithGrowthDiff, ICropYield, IHarvestCyclePhase, ITotalHarvest, TUniqueTiles } from '../utils/garden-helpers'

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
    cycleData: new Map(),
  }

  get dayHarvests(): DayHarvests {
    return this._dayHarvests
  }

  get totalHarvest(): ITotalHarvest {
    return this._totalHarvest
  }

  constructor() {
    this._dayHarvests = new Map()
    this._totalHarvest = {
      lastHarvestDay: 0,
      crops: new Map(),
      seedsRemainder: new Map(),
      cycleData: new Map(),
    }
  }

  private reset(): void {
    this._dayHarvests = new Map()
    this._totalHarvest = {
      lastHarvestDay: 0,
      crops: new Map(),
      seedsRemainder: new Map(),
      cycleData: new Map(),
    } as ITotalHarvest
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
        dayOfLastHarvest = getGrowthTimeLCM(tiles, options.useGrowthBoost)
        break

      // This uses the day in which the crop with the highest growth time is harvestable
      case 0:
      case 'M':
        dayOfLastHarvest = getHighestGrowthTime(tiles, options.useGrowthBoost)
        break

      // Manual input
      default:
        dayOfLastHarvest = options.days
    }

    let dayHarvests = new Map() as DayHarvests

    const seedsRequiredIdSuffix = options.useStarSeeds ? '-Star' : '-Base'

    // const cycleData = new Map() as Map<ICropNameWithGrowthDiff, ICropHarvestCycle>

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
      const baseStarCrops = Math.round((base * group.count) * finalStarChance)
      const baseBaseCrops = (base * group.count) - baseStarCrops

      // Extra crops are only calculated if there is a harvest boost
      const extraStarCrops = (hasHarvestBoost) ? Math.round((extra * group.count) * finalStarChance) : 0
      const extraBaseCrops = (hasHarvestBoost) ? (extra * group.count) - extraStarCrops : 0

      const totalStarCrops = baseStarCrops + extraStarCrops
      const totalBaseCrops = baseBaseCrops + extraBaseCrops

      // Stores the number of crops harvested, which is usually the same

      const starCrop = {
        base: baseStarCrops,
        extra: extraStarCrops,
        totalRaw: totalStarCrops,
        totalWithDeductions: totalStarCrops,
      } satisfies ICropYield

      const baseCrop = {
        base: baseBaseCrops,
        extra: extraBaseCrops,
        totalRaw: totalBaseCrops,
        totalWithDeductions: totalBaseCrops,
      } satisfies ICropYield

      /**
       * An array of days in which the crop is harvestable from moment of planting
       */
      const harvestableDays = crop.getHarvestableDays(options.useGrowthBoost && tile.bonuses.includes(Bonus.SpeedIncrease))

      /**
       * End of cycle and the final day of harvest
       */
      const lastDayOfCycle = harvestableDays[harvestableDays.length - 1]

      // Just a type check for TS
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
      // console.log(`Cycles: ${cycles}, Cycle Remainder: ${cycleRemainder}, Last Day of Cycle: ${lastDayOfCycle}, Day of Last Harvest: ${dayOfLastHarvest}`);

      let remainingHarvests = 0
      if (cycleRemainder > 0) {
        for (let i = 1; i <= cycleRemainder; i++) {
          if (harvestableDays.includes(i))
            remainingHarvests++
        }
      }

      // save cycle data
      const cropHarvestCycle = {
        cropType: tile.crop.type,
        totalHarvestsCount: (cycles * harvestableDays.length) + remainingHarvests,
        phases: [] as IHarvestCyclePhase[],
      } satisfies ICropHarvestCycle

      for (let phase = 0; phase < harvestableDays.length; phase++) {
        const phaseLength = (phase > 0)
          ? harvestableDays[phase] - harvestableDays[phase - 1]
          : harvestableDays[0]

        cropHarvestCycle.phases.push({
          dayOfHarvest: harvestableDays[phase],
          phaseLength,
          yield: {
            base: { ...baseCrop, isAveraged: false },
            star: { ...starCrop, isAveraged: false },
          },
        })
      }

      /**
       * The id of the seeds required for replanting, differentiated by base or star seeds
       */
      const seedsRequiredId = `${crop.type}${seedsRequiredIdSuffix}` satisfies ICropNameWithGrowthDiff

      /**
       * Whether to factor in growth boost for this crop
       */
      const differentiateByGrowthBoost = (options.useGrowthBoost && tile.bonuses.includes(Bonus.SpeedIncrease))


      /**
       * If growth boost is being factored in, we need to differentiate tiles that have growth boost from those that don't.
       * This is to help separate crops of the same type but different cycle times due to growth boost.
       */
      const seedsRequiredIdWithGrowth = (differentiateByGrowthBoost
        ? `${crop.type}-${options.useStarSeeds ? 'Star' : 'Base'}-Growth`
        : seedsRequiredId) satisfies ICropNameWithGrowthDiff

      const baseId = (differentiateByGrowthBoost ? `${crop.type}-Base-Growth` : `${crop.type}-Base`) satisfies ICropNameWithGrowthDiff
      const starId = (differentiateByGrowthBoost ? `${crop.type}-Star-Growth` : `${crop.type}-Star`) satisfies ICropNameWithGrowthDiff


      if (this._totalHarvest.cycleData.has(seedsRequiredIdWithGrowth)) {
        const totalHarvestCycleData = this._totalHarvest.cycleData.get(seedsRequiredIdWithGrowth)
        if (totalHarvestCycleData) {
          for (let i = 0; i < totalHarvestCycleData!.phases.length; i++) {
            totalHarvestCycleData!.phases[i].yield.base = { ...addCropYields(totalHarvestCycleData!.phases[i].yield.base, cropHarvestCycle.phases[i].yield.base), isAveraged: false }
            totalHarvestCycleData!.phases[i].yield.star = { ...addCropYields(totalHarvestCycleData!.phases[i].yield.star, cropHarvestCycle.phases[i].yield.star), isAveraged: false }
          }

          this._totalHarvest.cycleData.set(seedsRequiredIdWithGrowth, totalHarvestCycleData)
        }
      }
      else {
        this._totalHarvest.cycleData.set(seedsRequiredIdWithGrowth, cropHarvestCycle)
      }

      // Now that we've calculated the harvest for one cycle, we simply add the harvest info to all applicable days
      for (let cycle = 1; cycle <= cycles; cycle++) {
        harvestableDays.forEach((day) => {
          const dayInCycle = day + ((cycle - 1) * lastDayOfCycle)

          const harvestDay = dayHarvests.get(dayInCycle) ?? {
            day: dayInCycle,
            crops: new Map(),
            seedsRequired: new Map(),
          }

          const baseCropYield = harvestDay.crops.get(`${crop.type}-Base`) ?? { base: 0, extra: 0, totalRaw: 0, totalWithDeductions: 0 } satisfies ICropYield
          const starCropYield = harvestDay.crops.get(`${crop.type}-Star`) ?? { base: 0, extra: 0, totalRaw: 0, totalWithDeductions: 0 } satisfies ICropYield

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
            if (harvestDay.seedsRequired.get(seedsRequiredIdWithGrowth)) {
              harvestDay.seedsRequired.get(seedsRequiredIdWithGrowth).count += group.count
            }
            else {
              harvestDay.seedsRequired.set(seedsRequiredIdWithGrowth, {
                count: group.count,
                type: crop.type,
              })
            }
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

          harvestDay.crops.set(`${crop.type}-Base${differentiateByGrowthBoost ? '-Growth' : ''}`, {
            ...baseCrop,
            cropType: crop.type,
            isStar: false,
          })

          harvestDay.crops.set(`${crop.type}-Star${differentiateByGrowthBoost ? '-Growth' : ''}`, {
            ...starCrop,
            cropType: crop.type,
            isStar: true,
          })

          if (dayInCycle % lastDayOfCycle === 0) {
            // Marks a day where seeds are needed and how many
            if (harvestDay.seedsRequired.get(seedsRequiredIdWithGrowth)) {
              harvestDay.seedsRequired.get(seedsRequiredIdWithGrowth).count += group.count
            }
            else {
              harvestDay.seedsRequired.set(seedsRequiredIdWithGrowth, {
                count: group.count,
                type: crop.type,
              })
            }
          }

          dayHarvests.set(dayInCycle, harvestDay)
        }
      }
    }

    // Sort the harvests by day for chronological calculations
    dayHarvests = new Map([...dayHarvests.entries()].sort(([a], [b]) => a - b))

    // console.log('dayHarvests', dayHarvests)
    /**
     * Contains the remainder of seeds after replanting for the next replant cycle
     */
    const seedsRemainder = new Map() as Map<ICropNameWithGrowthDiff, number>

    /**
     * TODO: Think of a better name
     * - This is a tracker to find the total amount of crops left after seed replants,
     *   to get the average value of how many crops are usually left on replant days
     */
    const cropTotalsForAveraging = new Map() as Map<ICropNameWithGrowthDiff, {
      total: number
      days: number
    }>

    let cropsRequiredTracker = {
      totalCropsConsumed: 0,
      deductionsDone: 0
    }
    for (const [, harvest] of dayHarvests) {
      // Deduct seeds required for replanting
      if (options.includeReplantCost) {
        for (const [id, seedsRequiredInfo] of harvest.seedsRequired) {

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
          cropsRequiredTracker.totalCropsConsumed += cropsRequired
          cropsRequiredTracker.deductionsDone += 1

          const cropData = harvest.crops.get(id) || {
            base: 0,
            extra: 0,
            totalRaw: 0,
            totalWithDeductions: 0,
            cropType: seedsRequiredInfo.type,
          }

          const totalWithDeductions = cropData.totalWithDeductions - cropsRequired


          // Deducts the amount of crops required to convert to seeds
          // ! This method cannot pull from the pool of crops harvested from a plant with growth boost
          // ! if the seedsRequired id comes from a plant without growth boost
          // ! and vice versa
          // * However, since the total inventory of crops is calculated in the end, this might be fine
          harvest.crops.set(id, {
            ...cropData,
            isStar: options.useStarSeeds,
            totalWithDeductions,
          })

          // New seeds generated from the crops harvested
          const seedsGenerated = Math.floor(cropsRequired / cropsPerSeed) * seedsPerConversion

          const cropTotalTracker = cropTotalsForAveraging.get(id) || {
            total: 0,
            days: 0,
          }

          cropTotalsForAveraging.set(id, {
            total: cropTotalTracker.total + totalWithDeductions,
            days: cropTotalTracker.days + 1,
          })


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

    // Get the average yield on days where crops are harvested
    if (options.includeReplantCost) {
      if (cropTotalsForAveraging.size > 0) {
        for (const [cropId, cropTotal] of cropTotalsForAveraging) {

          const averageCropsConsumed = cropsRequiredTracker.totalCropsConsumed / cropsRequiredTracker.deductionsDone

          const isStar = cropId.includes('-Star')

          const cropCycleData = this._totalHarvest.cycleData.get(cropId)

          if (cropCycleData === undefined) {
            console.error('Somehow undefined')
            return
          }

          // Change the appropriate yield
          if (isStar) {
            cropCycleData.phases.at(-1)!.yield.star.totalWithDeductions -= Math.round(averageCropsConsumed)
            cropCycleData.phases.at(-1)!.yield.star.isAveraged = true
          }
          else {
            cropCycleData.phases.at(-1)!.yield.base.totalWithDeductions -= Math.round(averageCropsConsumed)
            cropCycleData.phases.at(-1)!.yield.base.isAveraged = true
          }
        }
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


    this._dayHarvests
    this._totalHarvest.crops
    this._totalHarvest.seedsRemainder
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

function hasYield(cropYield: ICropYield) {
  for (const val of Object.values(cropYield)) {
    if (val > 0)
      return true
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

/**
 * @param cropTiles - A map of crop groups
 * @returns The highest growth time of all crops
 */
function getHighestGrowthTime(cropTiles: TUniqueTiles, factorInGrowthBoost: boolean = false): number {
  let highestGrowthTime = 0
  for (const group of cropTiles.values()) {
    const crop = group.tile.crop
    if (!crop)
      continue

    const totalGrowthTime = crop.getTotalGrowTime(group.tile.bonuses.includes(Bonus.SpeedIncrease) && factorInGrowthBoost)
    if (totalGrowthTime > highestGrowthTime)
      highestGrowthTime = totalGrowthTime
  }

  return highestGrowthTime
}

/**
 * @param crops - A map of crop groups
 * @returns The least common multiple of all growth times of the crops
 */
function getGrowthTimeLCM(crops: TUniqueTiles, factorInGrowthBoost: boolean = false): number {
  if (crops.size === 0) {
    // console.warn('No crops found')
    return 0
  }

  const growthTimes = new Set<number>()
  for (const group of crops.values()) {
    const tile = group.tile
    if (!tile.crop)
      continue

    growthTimes.add(tile.crop.getTotalGrowTime(group.tile.bonuses.includes(Bonus.SpeedIncrease) && factorInGrowthBoost))
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
