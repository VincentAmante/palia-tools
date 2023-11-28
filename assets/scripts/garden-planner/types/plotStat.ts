import type CropType from '../enums/cropType'
import type { FertiliserType } from '../imports'
import type Bonus from '../enums/bonus'

interface PlotStat {
  cropCount: number
  cropTypeCount: {
    [CropType.Tomato]: number
    [CropType.Potato]: number
    [CropType.Wheat]: number
    [CropType.Rice]: number
    [CropType.Carrot]: number
    [CropType.Onion]: number
    [CropType.Cotton]: number
    [CropType.Apple]: number
    [CropType.Blueberry]: number
    [CropType.None]: number
  }
  cropBonusCoverage: {
    [Bonus.None]: number
    [Bonus.HarvestIncrease]: number
    [Bonus.WeedPrevention]: number
    [Bonus.WaterRetain]: number
    [Bonus.QualityIncrease]: number
    [Bonus.SpeedIncrease]: number
  }
  fertiliserCount: {
    [FertiliserType.None]: number
    [FertiliserType.QualityUp]: number
    [FertiliserType.HarvestBoost]: number
    [FertiliserType.WeedBlock]: number
    [FertiliserType.SpeedyGro]: number
    [FertiliserType.HydratePro]: number
  }
}

export type { PlotStat }
