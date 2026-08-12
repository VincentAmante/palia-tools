
import type FertiliserType from '../enums/fertiliser';
import Bonus from '../enums/bonus';
import { getFertiliserFromType } from '../fertiliserList';


export function getBonusDataByFertiliser(fertiliser: FertiliserType) {
  const bonus = getFertiliserFromType(fertiliser)?.effect || Bonus.None

  switch (bonus) {
    case Bonus.WaterRetain:
      return {
        icon: 'droplet',
        colour: 'text-water-retain',
        type: 'Water Retain',
        extraDetail: 'Helps keeps other nearby crop types hydrated',
      }
    case Bonus.QualityIncrease:
      return {
        icon: 'star',
        colour: 'text-quality-increase',
        type: 'Quality Increase',
        extraDetail: 'Boosts quality of other nearby crop types',
      }
    case Bonus.HarvestIncrease:
      return {
        icon: 'wheat-awn',
        colour: 'text-harvest-boost',
        type: 'Harvest Increase',
        extraDetail: 'Boosts amount harvested from other nearby crop types',
      }
    case Bonus.WeedPrevention:
      return {
        icon: 'shield',
        colour: 'text-weed-prevention',
        type: 'Weed Prevention',
        extraDetail: 'Prevents weeds from growing on other nearby crop types',
      }
    case Bonus.SpeedIncrease:
      return {
        icon: 'forward-fast',
        colour: 'text-growth-boost',
        type: 'Growth Boost',
        extraDetail: 'Boosts growth speed of other nearby crop types',
      }
    default:
      return {
        icon: '',
        colour: 'text-misc',
        type: '',
      }
  }
}

export function getBonusData(bonus: Bonus) {
  switch (bonus) {
    case Bonus.WaterRetain:
      return {
        icon: 'droplet',
        colour: 'text-water-retain',
        type: 'Water Retain',
        extraDetail: 'Helps keeps other nearby crop types hydrated',
      }
    case Bonus.QualityIncrease:
      return {
        icon: 'star',
        colour: 'text-quality-increase',
        type: 'Quality Increase',
        extraDetail: 'Boosts quality of other nearby crop types',
      }
    case Bonus.HarvestIncrease:
      return {
        icon: 'wheat-awn',
        colour: 'text-harvest-boost',
        type: 'Harvest Increase',
        extraDetail: 'Boosts amount harvested from other nearby crop types',
      }
    case Bonus.WeedPrevention:
      return {
        icon: 'shield',
        colour: 'text-weed-prevention',
        type: 'Weed Prevention',
        extraDetail: 'Prevents weeds from growing on other nearby crop types',
      }
    case Bonus.SpeedIncrease:
      return {
        icon: 'forward-fast',
        colour: 'text-growth-boost',
        type: 'Growth Boost',
        extraDetail: 'Boosts growth speed of other nearby crop types',
      }
    default:
      return {
        icon: '',
        colour: 'text-misc',
        type: '',
      }
  }
}