/**
 * @file gardenSimulatorTypes.ts
 * @description Contains types and interfaces used in the garden planner, specifically for one used by the harvester and the processor
*/
import type { ITile } from '../classes/tile';
import type CropType from '../enums/crops';

import type { Currency } from '../enums/currency';
import type { ItemType } from '../enums/itemType';

// CropType-Base or CropType-Star
export type ICropName = `${CropType}-Base` | `${CropType}-Star`

export type ICropNameWithGrowthDiff = `${CropType}-Base` | `${CropType}-Star` | `${CropType}-Base-Growth` | `${CropType}-Star-Growth`

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
  type: CropType
  count: number
}

// replacers for IDayResult, ICalculateValueResult, ISimulateYieldResult
export interface IDayHarvest {
  day: number
  crops: Map<ICropNameWithGrowthDiff, ICropYield & ICropInfo>
  seedsRequired: Map<ICropNameWithGrowthDiff, ISeedTracker>
  cropsHarvested: Set<CropType>
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

  // phase length = number of growth ticks
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
  cropCount: number
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

export interface FertiliserItem extends IInventoryItem {
  // Hard set irrelevant values
  // ? Could probably just re-write the whole Inventory Item thing
  itemType: ItemType.Fertiliser
  cropType: CropType.None
  isStar: false

  currency: Currency
}

export type TInventory = Map<string, IInventoryItem>

export type TCropTiles = Map<string, ITile>

export type TUniqueTiles = Map<string, {
  tile: ITile
  count: number
}>

export type CropItem = ItemType.Crop | ItemType.Seed | ItemType.Preserve