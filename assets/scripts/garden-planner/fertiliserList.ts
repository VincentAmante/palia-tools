import Fertiliser, { type IFertiliserConstructorParams } from './classes/fertiliser';
import FertiliserType from './enums/fertiliser';
import FertiliserCode from './enums/fertilisercode';

import fertilisersData from './fertilisersData.json';

const fertilisers = {} as Record<FertiliserType, Fertiliser | null>;

for (const [key, data] of Object.entries(fertilisersData)) {
  const type = key as FertiliserType;
  fertilisers[type] = data ? new Fertiliser(data as IFertiliserConstructorParams) : null;
}

function getFertiliserFromCode(code: FertiliserCode | string): Fertiliser | null {
  switch (code) {
    case FertiliserCode.QualityUp:
      return fertilisers[FertiliserType.QualityUp];
    case FertiliserCode.HarvestBoost:
      return fertilisers[FertiliserType.HarvestBoost];
    case FertiliserCode.WeedBlock:
      return fertilisers[FertiliserType.WeedBlock];
    case FertiliserCode.SpeedyGro:
      return fertilisers[FertiliserType.SpeedyGro];
    case FertiliserCode.HydratePro:
    case 'Hp':
      return fertilisers[FertiliserType.HydratePro];
    default:
      return fertilisers[FertiliserType.None];
  }
}

function getCodeFromFertiliser(fertiliser: Fertiliser): FertiliserCode {
  if (!fertiliser) return FertiliserCode.None;
  
  switch (fertiliser.type) {
    case FertiliserType.QualityUp:
      return FertiliserCode.QualityUp;
    case FertiliserType.HarvestBoost:
      return FertiliserCode.HarvestBoost;
    case FertiliserType.WeedBlock:
      return FertiliserCode.WeedBlock;
    case FertiliserType.SpeedyGro:
      return FertiliserCode.SpeedyGro;
    case FertiliserType.HydratePro:
      return FertiliserCode.HydratePro;
    default:
      return FertiliserCode.None;
  }
}

function getFertiliserFromType(type: FertiliserType): Fertiliser | null {
  return fertilisers[type] || null;
}

export { getFertiliserFromType, getFertiliserFromCode, getCodeFromFertiliser };
export default fertilisers;