import Fertiliser from './classes/Fertiliser'
import FertiliserType from './enums/fertiliser'
import FertiliserCode from './enums/fertiliserCode'
import Bonus from './enums/bonus'

const fertilisers = {
  [FertiliserType.HarvestBoost]: new Fertiliser(
    FertiliserType.HarvestBoost,
    Bonus.HarvestIncrease,
    '/fertilisers/harvest-boost.webp',
  ),
  [FertiliserType.SpeedyGro]: new Fertiliser(
    FertiliserType.SpeedyGro,
    Bonus.SpeedIncrease,
    '/fertilisers/speedy-gro.webp',
  ),
  [FertiliserType.QualityUp]: new Fertiliser(
    FertiliserType.QualityUp,
    Bonus.QualityIncrease,
    '/fertilisers/quality-up.webp',
  ),
  [FertiliserType.HydratePro]: new Fertiliser(
    FertiliserType.HydratePro,
    Bonus.WaterRetain,
    '/fertilisers/hydrate-pro.webp',
  ),
  [FertiliserType.WeedBlock]: new Fertiliser(
    FertiliserType.WeedBlock,
    Bonus.WeedPrevention,
    '/fertilisers/weed-block.webp',
  ),
  [FertiliserType.None]: null,
}

function getFertiliserFromCode(code: FertiliserCode): Fertiliser | null {
  switch (code) {
    case FertiliserCode.QualityUp:
      return fertilisers[FertiliserType.QualityUp]
    case FertiliserCode.HarvestBoost:
      return fertilisers[FertiliserType.HarvestBoost]
    case FertiliserCode.WeedBlock:
      return fertilisers[FertiliserType.WeedBlock]
    case FertiliserCode.SpeedyGro:
      return fertilisers[FertiliserType.SpeedyGro]
    case FertiliserCode.HydratePro:
      return fertilisers[FertiliserType.HydratePro]
    default:
      return fertilisers[FertiliserType.None]
  }
}

function getCodeFromFertiliser(fertiliser: Fertiliser): FertiliserCode {
  switch (fertiliser.type) {
    case FertiliserType.QualityUp:
      return FertiliserCode.QualityUp
    case FertiliserType.HarvestBoost:
      return FertiliserCode.HarvestBoost
    case FertiliserType.WeedBlock:
      return FertiliserCode.WeedBlock
    case FertiliserType.SpeedyGro:
      return FertiliserCode.SpeedyGro
    case FertiliserType.HydratePro:
      return FertiliserCode.HydratePro
    default:
      return FertiliserCode.None
  }
}

function getFertiliserFromType(type: FertiliserType): Fertiliser | null {
  return fertilisers[type]
}

export { getFertiliserFromType, getFertiliserFromCode, getCodeFromFertiliser }
export default fertilisers
