import { Bonus, CropType } from '../imports'

import type { DayHarvests, ICropName, ICropYield, ITotalHarvest, TUniqueTiles } from '../utils/garden-helpers'

export interface IHarvesterOptions {
  days: number | 'L' | 'M'
  includeReplant: boolean
  useStarSeeds: boolean
  includeReplantCost: boolean
  useGrowthBoost: boolean
  level: number
}

const TEST_OPTIONS: IHarvesterOptions = {
  days: 30,
  includeReplant: true,
  useStarSeeds: true,
  includeReplantCost: true,
  useGrowthBoost: true,
  level: 25,
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

  simulateYield(tiles: TUniqueTiles, options: IHarvesterOptions): void {
    if (tiles.size === 0)
      return

    console.time('simulateYield')

    const areOptionsEqual = this.areOptionsEqual(options)
    const useGrowthBoost = options.useGrowthBoost
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

    const dayHarvests = new Map() as DayHarvests

    for (const [id, group] of tiles) {
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

      const lastDayOfCycle = group.harvestableDays[group.harvestableDays.length - 1]
      if (lastDayOfCycle === undefined)
        continue

      const cycles = Math.floor(dayOfLastHarvest / lastDayOfCycle)
      const cycleRemainder = dayOfLastHarvest % lastDayOfCycle

      const seedsRequiredId = `${crop.type}-${options.useStarSeeds ? 'Star' : 'Base'}` as ICropName

      for (let cycle = 1; cycle <= cycles; cycle++) {
        group.harvestableDays.forEach((day) => {
          const dayInCycle = day * cycle
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

          // apply seeds required only on last day of cycle
          if (dayInCycle % lastDayOfCycle === 0) {
            harvestDay.seedsRequired.set(seedsRequiredId, {
              count: group.count,
            })
          }

          dayHarvests.set(dayInCycle, harvestDay)
        })
      }

      // Add the remainder of the last cycle
      if (cycleRemainder > 0) { 
        for (const day of group.harvestableDays) {
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
            })
          }

          dayHarvests.set(dayInCycle, harvestDay)
        }
      }
    }

    console.timeEnd('simulateYield')

    console.log(dayHarvests)
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
