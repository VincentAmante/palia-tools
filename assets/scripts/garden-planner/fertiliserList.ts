import Fertiliser from './classes/fertiliser'
import FertiliserType from './enums/fertiliser'
import FertiliserCode from './enums/fertilisercode'
import Bonus from './enums/bonus'

const fertilisers = {
  [FertiliserType.HarvestBoost]: new Fertiliser({
    type: FertiliserType.HarvestBoost,
    effect: Bonus.HarvestIncrease,
    image: 'https://pgp-cdn.b-cdn.net/harvest-boost.webp',
    costs: {
      zekiBatchPrice: 0,
      zekiBatchCount: 0,
      guildBatchPrice: 10,
      guildBatchCount: 50,
      goldSellValue: 5
    },
  }),
  [FertiliserType.SpeedyGro]: new Fertiliser({
    type: FertiliserType.SpeedyGro,
    effect: Bonus.SpeedIncrease,
    image: 'https://pgp-cdn.b-cdn.net/speedy-gro.webp',
    costs: {
      zekiBatchPrice: 0,
      zekiBatchCount: 0,
      guildBatchPrice: 10,
      guildBatchCount: 50,
      goldSellValue: 5
    },
  }),
  [FertiliserType.QualityUp]: new Fertiliser({
    type: FertiliserType.QualityUp,
    effect: Bonus.QualityIncrease,
    image: 'https://pgp-cdn.b-cdn.net/quality-up.webp',
    costs: {
      zekiBatchPrice: 0,
      zekiBatchCount: 0,
      guildBatchPrice: 0,
      guildBatchCount: 0,
      goldSellValue: 2
    },
  }),
  [FertiliserType.HydratePro]: new Fertiliser({
    type: FertiliserType.HydratePro,
    effect: Bonus.WaterRetain,
    image: 'https://pgp-cdn.b-cdn.net/hydrate-pro.webp',
    costs: {
      zekiBatchPrice: 40,
      zekiBatchCount: 20,
      guildBatchPrice: 0,
      guildBatchCount: 0,
      goldSellValue: 1
    },
  }
  ),
  [FertiliserType.WeedBlock]: new Fertiliser({
    type: FertiliserType.WeedBlock,
    effect: Bonus.WeedPrevention,
    image: 'https://pgp-cdn.b-cdn.net/weed-block.webp',
    costs: {
      zekiBatchPrice: 40,
      zekiBatchCount: 20,
      guildBatchPrice: 0,
      guildBatchCount: 0,
      goldSellValue: 1
    },
  }),
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
    case 'Hp' as FertiliserCode.HydratePro:
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
