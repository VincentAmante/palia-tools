/**
 * @file garden-helpers.ts
 * @description Contains types and interfaces used in the garden planner.
 */

import type Tile from '../classes/tile'
import { CropType, getCropFromCode, getCropFromType } from '../imports'
import { CropCode } from '../imports'

export interface ICalculateYieldOptions {
  days?: number
  includeReplant?: boolean
  postLevel25: boolean
  allStarSeeds?: boolean
  starChanceOverride?: number
  baseChanceOverride?: number
  includeReplantCost?: boolean
  useGrowthBoost?: boolean
  level: number
}

export type CalculateValueOptions = {
  [key in CropType]: {
    baseType: 'crop' | 'seed' | 'preserve'
    starType: 'crop' | 'seed' | 'preserve'
  }
}

export interface IHarvestInfo {
  day: number
  crops: {
    [key in CropType]: {
      base: number
      star: number
    }
  }
  seedsRemainder: {
    [key in CropType]: {
      base: number
      star: number
    }
  }
}

export interface ICropValue {
  produce: number
  type: 'crop' | 'seed' | 'preserve'
  gold: number
  cropRemainder: number
}

export function getCropValueMap(options: CalculateValueOptions) {
  const cropValueMap: Record<CropType, { base: ICropValue; star: ICropValue }> = {} as Record<
    CropType,
    { base: ICropValue; star: ICropValue }
  >

  for (const cropType of Object.values(CropType)) {
    cropValueMap[cropType] = {
      base: {
        produce: 0,
        type: options[cropType].baseType,
        gold: 0,
        cropRemainder: 0,
      },
      star: {
        produce: 0,
        type: options[cropType].starType,
        gold: 0,
        cropRemainder: 0,
      },
    }
  }

  return cropValueMap
}

interface CropYield {
  base: number
  star: number
}

export function getCropMap() {
  const cropValue: Record<CropType, CropYield> = {} as Record<CropType, CropYield>

  for (const cropType of Object.values(CropType)) {
    cropValue[cropType] = {
      base: 0,
      star: 0,
    }
  }

  return cropValue
}

export interface IDayResult {
  day: number
  crops: Record<CropType, { base: ICropValue; star: ICropValue }>
  totalGold: number
}

export interface ICalculateValueResult {
  result: IDayResult[]
  totalResult: IDayResult
}

export interface ISimulateYieldResult {
  harvests: IHarvestInfo[]
  harvestTotal: IHarvestInfo
}

// CropType-Base or CropType-Star
export type ICropName = `${CropType}-Base` | `${CropType}-Star`
export type ICropNameWithGrowthDiff = `${CropType}-Base` | `${CropType}-Star` | `${CropType}-Base-Growth` | `${CropType}-Star-Growth`

export interface ICropId {
  type: CropType
  code: CropCode
  isStar: boolean
  hasGrowthBoost: boolean
}

export interface ICropYield {
  base: number

  // from harvest boost
  extra: number

  // base + extra
  totalRaw: number

  // with deductions such as replanting
  totalWithDeductions: number
}

export interface ICropInfo {
  cropType: CropType
  isStar: boolean
}

export interface ISeedTracker {
  count: number
  type: CropType
}

// replacers for IDayResult, ICalculateValueResult, ISimulateYieldResult
export interface IDayHarvest {
  day: number
  crops: Map<ICropNameWithGrowthDiff, ICropYield & ICropInfo>
  seedsRequired: Map<ICropNameWithGrowthDiff, ISeedTracker>
}

export type DayHarvests = Map<number, IDayHarvest>

export interface IDayHarvests {
  [key: number]: IDayHarvest
}

export interface ITotalHarvest {
  lastHarvestDay: number
  crops: Map<ICropNameWithGrowthDiff, ICropYield & ICropInfo>
  seedsRemainder: Map<ICropNameWithGrowthDiff, ISeedTracker>
  cycleData: Map<ICropNameWithGrowthDiff, ICropHarvestCycle>
}

export interface IHarvestCyclePhase {
  dayOfHarvest: number
  phaseLength: number
  yield: {
    base: ICropYield & {
      isAveraged: boolean
    }
    star: ICropYield & {
      isAveraged: boolean
    }
  }
}

export interface ICropHarvestCycle {
  cropType: CropType
  totalHarvestsCount: number
  phases: IHarvestCyclePhase[]
}

export interface IInventoryItem {
  count: number
  img: {
    src: string
    alt: string
  }
  isStar: boolean
  baseGoldValue: number
  itemType: ItemType
  cropType: CropType
}

export type TInventory = Map<string, IInventoryItem>

export function parseCropId(cropId: string): ICropId {
  const [type, star, growth] = cropId.split('-')

  if (!type || !star) {
    throw new Error(`Invalid cropId format: ${cropId}`)
  }

  const isStar = star === 'Star'
  const hasGrowthBoost = growth === 'Growth'
  const code = getCropFromType(type as CropType)?.cropCode
  if (!code) {
    throw new Error(`Invalid crop type: ${type}`)
  }

  if (type === 'none') {
    throw new Error('Cannot parse "none" cropId')
  }
  if (Object.values(CropType).includes(type as CropType) === false) {
    throw new Error(`Invalid crop type: ${type}`)
  }

  return {
    type: type as CropType,
    code: code as CropCode,
    isStar,
    hasGrowthBoost,
  }
}

export function encodeCropId(options: { type: CropType; isStar: boolean; hasGrowthBoost?: boolean }): ICropNameWithGrowthDiff {
  if (!Object.values(CropType).includes(options.type)) {
    throw new Error(`Invalid crop type: ${options.type}`)
  }
  const starPart = options.isStar ? 'Star' : 'Base'
  const growthPart = options.hasGrowthBoost ? '-Growth' : ''
  return `${options.type}-${starPart}${growthPart}`
}

export function encodeCropIdWithCode(options: { code: CropCode; isStar: boolean; hasGrowthBoost?: boolean }): ICropNameWithGrowthDiff {
  if (!Object.values(CropCode).includes(options.code)) {
    throw new Error(`Invalid crop code: ${options.code}`)
  }
  const starPart = options.isStar ? 'Star' : 'Base'
  const growthPart = options.hasGrowthBoost ? '-Growth' : ''
  return `${getCropFromCode(options.code).type}-${starPart}${growthPart}`
}


export type TCropTiles = Map<string, Tile>

export type TUniqueTiles = Map<string, {
  tile: Tile
  count: number
}>

export enum ItemType {
  Crop = 'crop',
  Seed = 'seed',
  Preserve = 'preserve',
  Fertiliser = 'fertiliser',

  // Optional types
  Worm = 'worm',
  Fabric = 'fabric',
  Weed = 'weed',

  // For unimplemented items
  Misc = 'misc',
}

export type CropItem = ItemType.Crop | ItemType.Seed | ItemType.Preserve
