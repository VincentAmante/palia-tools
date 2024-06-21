import type Tile from '../classes/tile'
import { CropType } from '../imports'

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

export interface ICropYield {
  base: number

  // from harvest boost
  extra: number

  // base + extra
  total: number
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
  crops: Map<ICropName, ICropYield & ICropInfo>
  seedsRequired: Map<ICropName, ISeedTracker>
}

export type DayHarvests = Map<number, IDayHarvest>
export interface IDayHarvests {
  [key: number]: IDayHarvest
}

export interface ITotalHarvest {
  lastHarvestDay: number
  crops: Map<ICropName, ICropYield & ICropInfo>
  seedsRemainder: Map<ICropName, ISeedTracker>
}

export type TCropTiles = Map<string, Tile>

export type TUniqueTiles = Map<string, {
  tile: Tile
  count: number
}>
