import { Bonus, CropType, getCropFromType } from '../imports'

import type { DayHarvests, ICropName, ICropYield, ITotalHarvest, TUniqueTiles } from '../utils/garden-helpers'

export interface IHarvesterOptions {
  days: number | 'L' | 'M'
  includeReplant: boolean
  useStarSeeds: boolean
  includeReplantCost: boolean
  useGrowthBoost: boolean
  level: number
}

// type TileCacheId = ICropName & string & ('onLastDay' | 'notLastDay')
type TileCacheId = string

// class DayHarvestsHandler {
//   private _dayHarvests: DayHarvests = new Map()

//   constructor(dayHarvests: DayHarvests) {
//     this._dayHarvests = Object.assign({}, dayHarvests)
//   }

//   get dayHarvests(): DayHarvests {
//     return this._dayHarvests
//   }

//   set dayHarvests(dayHarvests: DayHarvests) {
//     this._dayHarvests = dayHarvests
//   }

//   addHarvest(day: number, cropId: string, cropYield: ICropYield): void {
//     const harvestDay = this._dayHarvests[day] ?? { dayInCycle: day, crops: new Map(), seedRemainder: new Map() }
//     harvestDay.crops.set(cropId, cropYield)

//     this._dayHarvests[day] = harvestDay
//   }

//   sort() {
//     this._dayHarvests = Object.fromEntries(Object.entries(this._dayHarvests).sort(([a], [b]) => Number.parseInt(a) - Number.parseInt(b)))
//   }
// }

export default class Harvester {
  private _dayHarvests: DayHarvests = new Map()
  private _totalHarvest: ITotalHarvest = {
    lastHarvestDay: 0,
    crops: new Map(),
    seedsRemainder: new Map(),
  }

  private _lastUsedOptions: IHarvesterOptions | null = null

  // TODO: Implement tile caching
  // TODO: for example: a crop with the same type and bonuses will have the same yield
  // TODO: so long as harvester options are the same
  private _tileCache: Map<TileCacheId, ICropYield> = new Map()

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
    this._tileCache.clear()
  }

  areOptionsEqual(options: IHarvesterOptions): boolean {
    const optionsToRead = Object.assign({}, options)
    if (this._lastUsedOptions === null) {
      this._lastUsedOptions = optionsToRead
      return false
    }

    const keys = Object.keys(optionsToRead) as (keyof IHarvesterOptions)[]
    for (const key of keys) {
      if (optionsToRead[key] !== this._lastUsedOptions[key]) {
        this._lastUsedOptions = optionsToRead
        return false
      }
    }

    return true
  }

  private reset(): void {
    this._dayHarvests.clear()
    this._totalHarvest = {
      lastHarvestDay: 0,
      crops: new Map(),
      seedsRemainder: new Map(),
    }
    this._tileCache.clear()
  }

  simulateYield(tiles: TUniqueTiles, options: IHarvesterOptions): void {
    if (tiles.size === 0)
      return

    this.reset()
    let dayOfLastHarvest = 0
    this._tileCache.clear()

    switch (options.days) {
      case 'L':
        dayOfLastHarvest = getGrowthTimeLCM(tiles)
        break
      case 0:
      case 'M':
        dayOfLastHarvest = getHighestGrowthTime(tiles)
        break
      default:
        dayOfLastHarvest = options.days
    }

    let dayHarvests = new Map() as DayHarvests

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

      // no more cache, just store it here
      const starCrop = {
        base: baseStarCrops * group.count,
        extra: extraStarCrops * group.count,
        total: totalStarCrops * group.count,
      }
      const baseCrop = {
        base: baseBaseCrops * group.count,
        extra: extraBaseCrops * group.count,
        total: totalBaseCrops * group.count,
      }

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

      for (let cycle = 1; cycle <= cycles; cycle++) {
        harvestableDays.forEach((day) => {
          const dayInCycle = day * cycle
          const harvestDay = dayHarvests.get(dayInCycle) ?? { day: dayInCycle, crops: new Map(), seedsRequired: new Map() }

          const baseCropYield = harvestDay.crops.get(`${crop.type}-Base`) ?? { base: 0, extra: 0, total: 0 }
          const starCropYield = harvestDay.crops.get(`${crop.type}-Star`) ?? { base: 0, extra: 0, total: 0 }

          harvestDay.crops.set(`${crop.type}-Base`, {
            ...addCropYields(baseCropYield, baseCrop),
            cropType: crop.type,
            isStar: options.useStarSeeds,
          })

          harvestDay.crops.set(`${crop.type}-Star`, {
            ...addCropYields(starCropYield, starCrop),
            cropType: crop.type,
            isStar: options.useStarSeeds,
          })

          // apply seeds required only on last day of cycle
          if (dayInCycle % lastDayOfCycle === 0) {
            harvestDay.seedsRequired.set(seedsRequiredId, {
              count: group.count,
              type: crop.type,
            })
          }

          dayHarvests.set(dayInCycle, harvestDay)
        })
      }

      // Add the remainder of the last cycle
      if (cycleRemainder > 0) {
        for (const day of harvestableDays) {
          const dayInCycle = lastDayOfCycle * cycles + day
          if (dayInCycle > dayOfLastHarvest)
            break

          const harvestDay = dayHarvests.get(dayInCycle) ?? { day: dayInCycle, crops: new Map(), seedsRequired: new Map() }

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
            harvestDay.seedsRequired.set(seedsRequiredId, {
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
            total: harvest.crops.get(id)!.total - cropsRequired,
          })
          const seedsGenerated = Math.floor(cropsRequired / cropsPerSeed) * seedsPerConversion
          const newRemainingSeeds = (remainingSeeds - remainderSeedsToBeUsed) + (seedsGenerated - seedsRequiredCount)
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
          total: 0,
        }
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

    console.log('ran simulateYield')
  }
}

function addCropYields(cropYield1: ICropYield, cropYield2: ICropYield): ICropYield {
  return {
    base: cropYield1.base + cropYield2.base,
    extra: cropYield1.extra + cropYield2.extra,
    total: cropYield1.total + cropYield2.total,
  }
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

  return Array.from(growthTimes).reduce((acc, cur) => (acc * cur) / gcd(acc, cur))
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}
