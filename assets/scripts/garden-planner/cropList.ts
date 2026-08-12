import Crop, { type ICropConstructorParams } from './classes/crop'
import CropType from './enums/crops'
import Bonus from './enums/bonus'
import type CropCode from './enums/cropCode'
import cropsData from './cropsData.json';

export const bonusBackgrounds: Record<Bonus, string> = {
  [Bonus.WaterRetain]: 'bg-water-retain/20 dark:bg-water-retain/40',
  [Bonus.HarvestIncrease]: 'bg-harvest-boost/20 dark:bg-harvest-boost/30',
  [Bonus.WeedPrevention]: 'bg-weed-prevention/20 dark:bg-weed-prevention/40',
  [Bonus.QualityIncrease]: 'bg-quality-increase/20 dark:bg-quality-increase/40',
  [Bonus.SpeedIncrease]: 'bg-growth-boost/20',
  [Bonus.None]: 'bg-transparent',
};

const crops = {} as Record<CropType, Crop>;
for (const [key, data] of Object.entries(cropsData)) {
  const cropType = key as CropType;
  crops[cropType] = new Crop(data as ICropConstructorParams);
}

function getCropFromCode(code: CropCode): Crop {
  return Object.values(crops).find(crop => crop.cropCode === code) || crops[CropType.None];
}

function getCodeFromCrop(crop: Crop): CropCode {
  return crop.cropCode
}

function getCropFromType(type: CropType): Crop | null {
  return crops[type]
}

export { getCropFromCode, getCodeFromCrop, getCropFromType }
export default crops
