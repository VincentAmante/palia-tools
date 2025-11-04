import Crop from './classes/crop'
import CropType from './enums/crops'
import Bonus from './enums/bonus'
import CropCode from './enums/cropCode'
import CropSize from './enums/crop-size'

const WATER_RETAIN_BG = 'bg-water-retain/20 dark:bg-water-retain/40';
const HARVEST_BOOST_BG = 'bg-harvest-boost/20 dark:bg-harvest-boost/30';
const WEED_PREVENTION_BG = 'bg-weed-prevention/20 dark:bg-weed-prevention/40';
const QUALITY_INCREASE_BG = 'bg-quality-increase/20 dark:bg-quality-increase/40'
const GROWTH_BOOST_BG = 'bg-growth-boost/20';



const TOMATO = new Crop({
  type: CropType.Tomato,
  cropBonus: Bonus.WaterRetain,
  size: CropSize.Single,
  image: 'https://pgp-cdn.b-cdn.net/tomato-crop.webp',
  growthInfoData: {
    base: 2,
    growthTime: 4,
    isReharvestable: true,
    reharvestCooldown: 2,
    reharvestLimit: 3,
  },
  goldValueData: {
    crop: 23,
    cropStar: 34,
    seed: 40,
    seedStar: 60,
    hasPreserve: true,
    preserve: 34,
    preserveStar: 51,
  },
  conversionInfo: {
    cropsPerSeed: 3,
    seedsPerConversion: 2,
    cropsPerPreserve: 1,
    seedProcessMinutes: 30,
    preserveProcessMinutes: 27,
  },
  images: {
    preserve: 'https://pgp-cdn.b-cdn.net/tomato-jar.webp',
    seed: 'https://pgp-cdn.b-cdn.net/tomato-seed.webp',
  },
  metadata: {
    cropCode: CropCode.Tomato,
    cropTooltip: 'Tomato: Water Retention',
    cropBackgroundColor: WATER_RETAIN_BG,
  },
  costs: {
    zekiPrice: 80,
    guildPrice: 0,
    potionPrice: 0
  }
})

const POTATO = new Crop({
  type: CropType.Potato,
  cropBonus: Bonus.WaterRetain,
  size: CropSize.Single,
  image: 'https://pgp-cdn.b-cdn.net/potato-crop.webp',
  growthInfoData: {
    base: 2,
    growthTime: 5,
  },
  goldValueData: {
    crop: 45,
    cropStar: 67,
    seed: 20,
    seedStar: 30,
    hasPreserve: true,
    preserve: 68,
    preserveStar: 102,
  },
  conversionInfo: {
    cropsPerSeed: 1,
    seedsPerConversion: 4,
    cropsPerPreserve: 1,
    seedProcessMinutes: 84,
    preserveProcessMinutes: 54,
  },
  images: {
    preserve: 'https://pgp-cdn.b-cdn.net/potato-jar.webp',
    seed: 'https://pgp-cdn.b-cdn.net/potato-seed.webp',
  },
  metadata: {
    cropCode: CropCode.Potato,
    cropTooltip: 'Potato: Water Retention',
    cropBackgroundColor: WATER_RETAIN_BG,
  },
  costs: {
    zekiPrice: 40,
    guildPrice: 0,
    potionPrice: 0
  }
})

const RICE = new Crop({
  type: CropType.Rice,
  cropBonus: Bonus.HarvestIncrease,
  size: CropSize.Single,
  image: 'https://pgp-cdn.b-cdn.net/rice-crop.webp',
  growthInfoData: {
    base: 2,
    growthTime: 3,
    isReharvestable: true,
  },
  goldValueData: {
    crop: 27,
    cropStar: 40,
    seed: 11,
    seedStar: 16,
    hasPreserve: false,
    preserve: 0,
    preserveStar: 0,
  },
  conversionInfo: {
    cropsPerSeed: 1,
    seedsPerConversion: 4,
    cropsPerPreserve: 0,
    seedProcessMinutes: 42,
    preserveProcessMinutes: 0,
  },
  images: {
    preserve: '',
    seed: 'https://pgp-cdn.b-cdn.net/rice-seed.webp',
  },
  metadata: {
    cropCode: CropCode.Rice,
    cropTooltip: 'Rice: Harvest Increase',
    cropBackgroundColor: HARVEST_BOOST_BG,
  },

  costs: {
    zekiPrice: 23,
    guildPrice: 0,
    potionPrice: 0
  }
})

const WHEAT = new Crop({
  type: CropType.Wheat,
  cropBonus: Bonus.HarvestIncrease,
  size: CropSize.Single,
  image: 'https://pgp-cdn.b-cdn.net/wheat-crop.webp',
  growthInfoData: {
    base: 2,
    growthTime: 4,
  },
  goldValueData: {
    crop: 33,
    cropStar: 49,
    seed: 12,
    seedStar: 18,
    hasPreserve: false,
    preserve: 0,
    preserveStar: 0,
  },
  conversionInfo: {
    cropsPerSeed: 1,
    seedsPerConversion: 4,
    cropsPerPreserve: 0,
    seedProcessMinutes: 42,
    preserveProcessMinutes: 0,
  },
  images: {
    preserve: '',
    seed: 'https://pgp-cdn.b-cdn.net/wheat-seed.webp',
  },
  metadata: {
    cropCode: CropCode.Wheat,
    cropTooltip: 'Wheat: Harvest Increase',
    cropBackgroundColor: HARVEST_BOOST_BG,
  },

  costs: {
    zekiPrice: 25,
    guildPrice: 0,
    potionPrice: 0
  }
})

const CARROT = new Crop({
  type: CropType.Carrot,
  cropBonus: Bonus.WeedPrevention,
  size: CropSize.Single,
  image: 'https://pgp-cdn.b-cdn.net/carrot-crop.webp',
  growthInfoData: {
    base: 2,
    growthTime: 3,
  },
  goldValueData: {
    crop: 23,
    cropStar: 34,
    seed: 7,
    seedStar: 10,
    hasPreserve: true,
    preserve: 34,
    preserveStar: 51,
  },
  conversionInfo: {
    cropsPerSeed: 1,
    seedsPerConversion: 4,
    cropsPerPreserve: 1,
    seedProcessMinutes: 18,
    preserveProcessMinutes: 27,
  },
  images: {
    preserve: 'https://pgp-cdn.b-cdn.net/carrot-jar.webp',
    seed: 'https://pgp-cdn.b-cdn.net/carrot-seed.webp',
  },
  metadata: {
    cropCode: CropCode.Carrot,
    cropTooltip: 'Carrot: Weed Prevention',
    cropBackgroundColor: WEED_PREVENTION_BG,
  },

  costs: {
    zekiPrice: 15,
    guildPrice: 0,
    potionPrice: 0
  }
})

const ONION = new Crop({
  type: CropType.Onion,
  cropBonus: Bonus.WeedPrevention,
  size: CropSize.Single,
  image: 'https://pgp-cdn.b-cdn.net/onion-crop.webp',
  growthInfoData: {
    base: 2,
    growthTime: 4,
  },
  goldValueData: {
    crop: 30,
    cropStar: 45,
    seed: 10,
    seedStar: 15,
    hasPreserve: true,
    preserve: 45,
    preserveStar: 67,
  },
  conversionInfo: {
    cropsPerSeed: 1,
    seedsPerConversion: 4,
    cropsPerPreserve: 1,
    seedProcessMinutes: 24,
    preserveProcessMinutes: 36,
  },
  images: {
    preserve: 'https://pgp-cdn.b-cdn.net/onion-jar.webp',
    seed: 'https://pgp-cdn.b-cdn.net/onion-seed.webp',
  },
  metadata: {
    cropCode: CropCode.Onion,
    cropTooltip: 'Onion: Weed Prevention',
    cropBackgroundColor: WEED_PREVENTION_BG,
  },

  costs: {
    zekiPrice: 20,
    guildPrice: 0,
    potionPrice: 0
  }
})

const COTTON = new Crop({
  type: CropType.Cotton,
  cropBonus: Bonus.QualityIncrease,
  size: CropSize.Single,
  image: 'https://pgp-cdn.b-cdn.net/cotton-crop.webp',
  growthInfoData: {
    base: 2,
    growthTime: 5,
  },
  goldValueData: {
    crop: 45,
    cropStar: 67,
    seed: 20,
    seedStar: 30,
    hasPreserve: false,
    preserve: 0,
    preserveStar: 0,
  },
  conversionInfo: {
    cropsPerSeed: 1,
    seedsPerConversion: 3,
    cropsPerPreserve: 0,
    seedProcessMinutes: 36,
    preserveProcessMinutes: 0,
  },
  images: {
    preserve: '',
    seed: 'https://pgp-cdn.b-cdn.net/cotton-seed.webp',
  },
  metadata: {
    cropCode: CropCode.Cotton,
    cropTooltip: 'Cotton: Quality Increase',
    cropBackgroundColor: QUALITY_INCREASE_BG,
  },

  costs: {
    zekiPrice: 40,
    guildPrice: 0,
    potionPrice: 0
  }
})

const BLUEBERRY = new Crop({
  type: CropType.Blueberry,
  cropBonus: Bonus.HarvestIncrease,
  size: CropSize.Bush,
  image: 'https://pgp-cdn.b-cdn.net/blueberry-crop.webp',
  growthInfoData: {
    base: 6,
    growthTime: 9,
    isReharvestable: true,
    reharvestCooldown: 3,
    reharvestLimit: 3,
  },
  goldValueData: {
    crop: 39,
    cropStar: 58,
    seed: 112,
    seedStar: 168,
    hasPreserve: true,
    preserve: 59,
    preserveStar: 88,
  },
  conversionInfo: {
    cropsPerSeed: 4,
    seedsPerConversion: 2,
    cropsPerPreserve: 1,
    seedProcessMinutes: 81,
    preserveProcessMinutes: 47.25,
  },
  images: {
    preserve: 'https://pgp-cdn.b-cdn.net/blueberry-jar.webp',
    seed: 'https://pgp-cdn.b-cdn.net/blueberry-seed.webp',
  },
  metadata: {
    cropCode: CropCode.Blueberry,
    cropTooltip: 'Berry Bush: Harvest Increase. 2x2, needs 2 of a bonus for the buff to activate',
    cropBackgroundColor: HARVEST_BOOST_BG,
  },

  costs: {
    zekiPrice: 0,
    guildPrice: 45,
    potionPrice: 0
  }
})

const APPLE = new Crop({
  type: CropType.Apple,
  cropBonus: Bonus.HarvestIncrease,
  size: CropSize.Tree,
  image: 'https://pgp-cdn.b-cdn.net/apple-crop.webp',
  growthInfoData: {
    base: 16,
    growthTime: 12,
    isReharvestable: true,
    reharvestCooldown: 6,
    reharvestLimit: 3,
  },
  goldValueData: {
    crop: 64,
    cropStar: 96,
    seed: 700,
    seedStar: 1050,
    hasPreserve: true,
    preserve: 96,
    preserveStar: 144,
  },
  conversionInfo: {
    cropsPerSeed: 10,
    seedsPerConversion: 1,
    cropsPerPreserve: 1,
    seedProcessMinutes: 142,
    preserveProcessMinutes: 76,
  },
  images: {
    preserve: 'https://pgp-cdn.b-cdn.net/apple-jar.webp',
    seed: 'https://pgp-cdn.b-cdn.net/apple-seed.webp',
  },
  metadata: {
    cropCode: CropCode.Apple,
    cropTooltip: 'Apple Tree: Harvest Increase. 3x3, needs 3 of a bonus for the buff to activate',
    cropBackgroundColor: HARVEST_BOOST_BG,
  },

  costs: {
    zekiPrice: 0,
    guildPrice: 280,
    potionPrice: 0
  }
})

const CORN = new Crop({
  type: CropType.Corn,
  cropBonus: Bonus.HarvestIncrease,
  size: CropSize.Single,
  image: 'https://pgp-cdn.b-cdn.net/corn-crop.webp',
  growthInfoData: {
    base: 2,
    growthTime: 5,
  },
  goldValueData: {
    crop: 40,
    cropStar: 60,
    seed: 15,
    seedStar: 22,
    hasPreserve: true,
    preserve: 60,
    preserveStar: 90,
  },
  conversionInfo: {
    cropsPerSeed: 1,
    seedsPerConversion: 4,
    cropsPerPreserve: 1,
    seedProcessMinutes: 48,
    preserveProcessMinutes: 48,
  },
  images: {
    preserve: 'https://pgp-cdn.b-cdn.net/corn-jar.webp',
    seed: 'https://pgp-cdn.b-cdn.net/corn-seed.webp',
  },
  metadata: {
    cropCode: CropCode.Corn,
    cropTooltip: 'Corn: Harvest Increase',
    cropBackgroundColor: HARVEST_BOOST_BG,
  },

  costs: {
    zekiPrice: 30,
    guildPrice: 0,
    potionPrice: 0
  }
})

const SPICY_PEPPER = new Crop({
  type: CropType.SpicyPepper,
  cropBonus: Bonus.QualityIncrease,
  size: CropSize.Bush,
  image: 'https://pgp-cdn.b-cdn.net/spicy-pepper-crop.webp',
  growthInfoData: {
    base: 6,
    growthTime: 6,
    isReharvestable: true,
    reharvestCooldown: 3,
    reharvestLimit: 3,
  },
  goldValueData: {
    crop: 32,
    cropStar: 48,
    seed: 85,
    seedStar: 127,
    hasPreserve: true,
    preserve: 48,
    preserveStar: 72,
  },
  conversionInfo: {
    cropsPerSeed: 4,
    seedsPerConversion: 2,
    cropsPerPreserve: 1,
    seedProcessMinutes: 100,
    preserveProcessMinutes: 38.5,
  },
  images: {
    preserve: 'https://pgp-cdn.b-cdn.net/spicy-pepper-jar.webp',
    seed: 'https://pgp-cdn.b-cdn.net/spicy-pepper-seed.webp',
  },
  metadata: {
    cropCode: CropCode.SpicyPepper,
    cropTooltip: 'Spicy Pepper: Quality Increase. 2x2, needs 2 of a bonus for the buff to activate',
    cropBackgroundColor: QUALITY_INCREASE_BG,
  },

  costs: {
    zekiPrice: 170,
    guildPrice: 0,
    potionPrice: 0
  }
})

const NAPA_CABBAGE = new Crop({
  type: CropType.NapaCabbage,
  cropBonus: Bonus.WaterRetain,
  size: CropSize.Single,
  image: 'https://pgp-cdn.b-cdn.net/napa-cabbage-crop.webp',
  growthInfoData: {
    base: 2,
    growthTime: 6,
  },
  goldValueData: {
    crop: 40,
    cropStar: 60,
    seed: 10,
    seedStar: 15,
    hasPreserve: true,
    preserve: 60,
    preserveStar: 90,
  },
  conversionInfo: {
    cropsPerSeed: 1,
    seedsPerConversion: 6,
    cropsPerPreserve: 1,
    seedProcessMinutes: 48,
    preserveProcessMinutes: 48,
  },
  images: {
    preserve: 'https://pgp-cdn.b-cdn.net/napa-cabbage-jar.webp',
    seed: 'https://pgp-cdn.b-cdn.net/napa-cabbage-seed.webp',
  },
  metadata: {
    cropCode: CropCode.NapaCabbage,
    cropTooltip: 'Napa Cabbage: Water Retention',
    cropBackgroundColor: WATER_RETAIN_BG,
  },

  costs: {
    zekiPrice: 20,
    guildPrice: 0,
    potionPrice: 0
  }
})

const BOK_CHOY = new Crop({
  type: CropType.BokChoy,
  cropBonus: Bonus.WeedPrevention,
  size: CropSize.Single,
  image: 'https://pgp-cdn.b-cdn.net/bok-choy-crop.webp',
  growthInfoData: {
    base: 2,
    growthTime: 3,
  },
  goldValueData: {
    crop: 30,
    cropStar: 45,
    seed: 15,
    seedStar: 22,
    hasPreserve: true,
    preserve: 45,
    preserveStar: 67,
  },
  conversionInfo: {
    cropsPerSeed: 1,
    seedsPerConversion: 4,
    cropsPerPreserve: 1,
    seedProcessMinutes: 72,
    preserveProcessMinutes: 36,
  },
  images: {
    preserve: 'https://pgp-cdn.b-cdn.net/bok-choy-jar.webp',
    seed: 'https://pgp-cdn.b-cdn.net/bok-choy-seed.webp',
  },
  metadata: {
    cropCode: CropCode.BokChoy,
    cropTooltip: 'Bok Choy: Weed Prevention',
    cropBackgroundColor: WEED_PREVENTION_BG,
  },

  costs: {
    zekiPrice: 30,
    guildPrice: 0,
    potionPrice: 0
  }
})

const BATTERFLY_BEAN = new Crop({
  type: CropType.BatterflyBean,
  cropBonus: Bonus.HarvestIncrease,
  size: CropSize.Bush,
  image: 'https://pgp-cdn.b-cdn.net/batterfly-bean-crop.webp',
  growthInfoData: {
    base: 6,
    growthTime: 6,
    isReharvestable: true,
    reharvestCooldown: 2,
    reharvestLimit: 3,
  },
  goldValueData: {
    crop: 28,
    cropStar: 42,
    seed: 90,
    seedStar: 135,
    hasPreserve: true,
    preserve: 41,
    preserveStar: 61,
  },
  conversionInfo: {
    cropsPerSeed: 2,
    seedsPerConversion: 1,
    cropsPerPreserve: 1,
    seedProcessMinutes: 85,
    preserveProcessMinutes: 33,
  },
  images: {
    preserve: 'https://pgp-cdn.b-cdn.net/batterfly-bean-jar.webp',
    seed: 'https://pgp-cdn.b-cdn.net/batterfly-bean-seed.webp',
  },
  metadata: {
    cropCode: CropCode.BatterflyBean,
    cropTooltip: 'Batterfly Bean',
    cropBackgroundColor: HARVEST_BOOST_BG,
  },

  costs: {
    zekiPrice: 0,
    guildPrice: 0,
    potionPrice: 0
  }
})

const ROCKHOPPER_PUMPKIN = new Crop({
  type: CropType.RockhopperPumpkin,
  cropBonus: Bonus.QualityIncrease,
  size: CropSize.Bush,
  image: 'https://pgp-cdn.b-cdn.net/pumpkin-crop.webp',
  growthInfoData: {
    base: 2,
    growthTime: 9,
    isReharvestable: true,
    reharvestCooldown: 2,
    reharvestLimit: 3,
  },
  goldValueData: {
    crop: 88,
    cropStar: 132,
    seed: 25,
    seedStar: 37,
    hasPreserve: true,
    preserve: 101,
    preserveStar: 151,
  },
  conversionInfo: {
    cropsPerSeed: 1,
    seedsPerConversion: 4,
    cropsPerPreserve: 1,
    seedProcessMinutes: 100,
    preserveProcessMinutes: 31.5,
  },
  images: {
    preserve: 'https://pgp-cdn.b-cdn.net/pumpkin-jar.webp',
    seed: 'https://pgp-cdn.b-cdn.net/pumpkin-seed.webp',
  },
  metadata: {
    cropCode: CropCode.RockhopperPumpkin,
    cropTooltip: 'Rockhopper Pumpkin',
    cropBackgroundColor: QUALITY_INCREASE_BG,
  },

  costs: {
    zekiPrice: 0,
    guildPrice: 0,
    potionPrice: 500
  }
})

const NULLCROP = new Crop({
  type: CropType.None,
  cropBonus: Bonus.None,
  size: CropSize.Single,
  image: '',
  growthInfoData: {
    base: 0,
    growthTime: 0,
  },
  goldValueData: {
    crop: 0,
    cropStar: 0,
    seed: 0,
    seedStar: 0,
    hasPreserve: false,
    preserve: 0,
    preserveStar: 0,
  },
  conversionInfo: {
    cropsPerSeed: 0,
    seedsPerConversion: 0,
    cropsPerPreserve: 0,
    seedProcessMinutes: 0,
    preserveProcessMinutes: 0,
  },
  images: {
    preserve: '',
    seed: '',
  },
  metadata: {
    cropCode: CropCode.None,
    cropTooltip: '',
    cropBackgroundColor: '',
  },
  costs: {
    zekiPrice: 0,
    guildPrice: 0,
    potionPrice: 0
  }
})

// Helper functions to get crop data from the crop code
const crops = {
  [CropType.Tomato]: TOMATO,
  [CropType.Potato]: POTATO,
  [CropType.Rice]: RICE,
  [CropType.Wheat]: WHEAT,
  [CropType.Carrot]: CARROT,
  [CropType.Onion]: ONION,
  [CropType.Cotton]: COTTON,
  [CropType.Blueberry]: BLUEBERRY,
  [CropType.Apple]: APPLE,
  [CropType.Corn]: CORN,
  [CropType.SpicyPepper]: SPICY_PEPPER,
  [CropType.NapaCabbage]: NAPA_CABBAGE,
  [CropType.BokChoy]: BOK_CHOY,
  [CropType.RockhopperPumpkin]: ROCKHOPPER_PUMPKIN,
  [CropType.BatterflyBean]: BATTERFLY_BEAN,
  [CropType.None]: NULLCROP,
} as const

function getCropFromCode(code: CropCode): Crop {
  switch (code) {
    case CropCode.Tomato:
      return crops[CropType.Tomato]
    case CropCode.Potato:
      return crops[CropType.Potato]
    case CropCode.Rice:
      return crops[CropType.Rice]
    case CropCode.Wheat:
      return crops[CropType.Wheat]
    case CropCode.Carrot:
      return crops[CropType.Carrot]
    case CropCode.Onion:
      return crops[CropType.Onion]
    case CropCode.Cotton:
      return crops[CropType.Cotton]
    case CropCode.Blueberry:
      return crops[CropType.Blueberry]
    case CropCode.Apple:
      return crops[CropType.Apple]
    case CropCode.Corn:
      return crops[CropType.Corn]
    case CropCode.SpicyPepper:
      return crops[CropType.SpicyPepper]
    case CropCode.NapaCabbage:
      return crops[CropType.NapaCabbage]
    case CropCode.BokChoy:
      return crops[CropType.BokChoy]
    case CropCode.RockhopperPumpkin:
      return crops[CropType.RockhopperPumpkin]
    case CropCode.BatterflyBean:
      return crops[CropType.BatterflyBean]
    default:
      return crops[CropType.None]
  }
}

function getCodeFromCrop(crop: Crop): CropCode {
  return crop.cropCode
}

function getCropFromType(type: CropType): Crop | null {
  return crops[type]
}

export { getCropFromCode, getCodeFromCrop, getCropFromType }
export default crops
