import { CropType } from '../imports'
import { CropItem } from '../classes/Items/Item'
import { getCropFromType } from '../cropList'
import ItemType from '../enums/itemType'

export interface ICalculateYieldOptions {
  days?: number
  includeReplant?: boolean
  useStarSeeds?: boolean
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

/**
 * Retrieves a map of all crop types for use in counting
 * @returns A record object representing the crop map.
 */
export function getCropMap(): Record<CropType, CropYield> {
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

export interface HarvestSimulatorLog {
  day: number
  crops: Record<CropType, CropYield>
  seedsRemainder: Record<CropType, CropYield>
}

export interface HarvestInventory {
  crops: Record<CropType, {
    base: number
    star: number
  }>
  seedsLeft: Record<CropType, {
    base: number
    star: number
  }>
}

export function createItemFromCrop(cropType: CropType, isStar: boolean, count: number = 0): CropItem {
  const crop = getCropFromType(cropType)

  if (!crop)
    throw new Error(`Could not find crop with type ${cropType}`)

  return new CropItem(
    crop.type,
    ItemType.Crop,
    crop.image,
    (isStar ? crop.goldValues.cropStar : crop.goldValues.crop),
    isStar,
    30,
    count,
    cropType,
  )
}
