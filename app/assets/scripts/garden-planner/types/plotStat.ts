import type CropType from '../enums/crops'
import type { FertiliserType } from '../imports'
import type Bonus from '../enums/bonus'

interface PlotStat {
  cropCount: number
  cropTypeCount: { [key in CropType]: number }
  cropBonusCoverage: { [key in Bonus]: number }
  fertiliserCount: { [key in FertiliserType]: number }
}

export type { PlotStat }
