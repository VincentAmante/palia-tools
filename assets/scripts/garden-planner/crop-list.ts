import Crop from './classes/crop'
import CropType from './enums/crops'
import Bonus from './enums/bonus'
import CropCode from './enums/cropcode'
import CropSize from './enums/crop-size'

const crops = {
  [CropType.Tomato]: new Crop(
    CropType.Tomato,
    Bonus.WaterRetain,
    CropSize.Single,
    '/crops/tomato.webp',
    // Base Values
    {
      base: 2,
      growthTime: 4,
      isReharvestable: true,
      reharvestCooldown: 2,
      reharvestLimit: 3,
    },

    // Gold Values
    {
      crop: 23,
      cropStar: 34,
      seed: 40,
      seedStar: 60,
      hasPreserve: true,
      preserve: 34,
      preserveStar: 51,
    },

    // Conversion Info
    {
      cropsPerSeed: 3,
      seedsPerConversion: 2,
      cropsPerPreserve: 1,
    },
    {
      preserve: '/jars/tomato.png',
      seed: '/seeds/tomato.png',
    },
    {
      cropCode: CropCode.Tomato,
      cropTooltip: 'Tomato: Water Retention',
      cropBackgroundColor: 'bg-blue-700',
    },
  ),

  [CropType.Potato]: new Crop(
    CropType.Potato,
    Bonus.WaterRetain,
    CropSize.Single,
    '/crops/potato.webp',
    {
      base: 2,
      growthTime: 5,
    },
    {
      crop: 45,
      cropStar: 67,
      seed: 20,
      seedStar: 30,
      hasPreserve: true,
      preserve: 68,
      preserveStar: 102,
    },
    {
      cropsPerSeed: 1,
      seedsPerConversion: 4,
      cropsPerPreserve: 1,
    },
    {
      preserve: '/jars/potato.png',
      seed: '/seeds/potato.png',
    },
    {
      cropCode: CropCode.Potato,
      cropTooltip: 'Potato: Water Retention',
      cropBackgroundColor: 'bg-blue-800',
    },
  ),

  [CropType.Rice]: new Crop(
    CropType.Rice,
    Bonus.HarvestIncrease,
    CropSize.Single,
    '/crops/rice.webp',
    {
      base: 2,
      growthTime: 3,
      isReharvestable: true,
    },
    {
      crop: 27,
      cropStar: 40,
      seed: 11,
      seedStar: 16,
      hasPreserve: false,
      preserve: 0,
      preserveStar: 0,
    },
    {
      cropsPerSeed: 1,
      seedsPerConversion: 4,
      cropsPerPreserve: 0,
    },
    {
      preserve: '',
      seed: '/seeds/rice.png',
    },
    {
      cropCode: CropCode.Rice,
      cropTooltip: 'Rice: Harvest Increase',
      cropBackgroundColor: 'bg-green-700',
    },
  ),

  [CropType.Wheat]: new Crop(
    CropType.Wheat,
    Bonus.HarvestIncrease,
    CropSize.Single,
    '/crops/wheat.webp',
    {
      base: 2,
      growthTime: 4,
    },
    {
      crop: 33,
      cropStar: 49,
      seed: 12,
      seedStar: 18,
      hasPreserve: false,
      preserve: 0,
      preserveStar: 0,
    },
    {
      cropsPerSeed: 1,
      seedsPerConversion: 4,
      cropsPerPreserve: 0,
    },
    {
      preserve: '',
      seed: '/seeds/wheat.png',
    },
    {
      cropCode: CropCode.Wheat,
      cropTooltip: 'Wheat: Harvest Increase',
      cropBackgroundColor: 'bg-green-800',
    },
  ),
  [CropType.Carrot]: new Crop(
    CropType.Carrot,
    Bonus.WeedPrevention,
    CropSize.Single,
    '/crops/carrot.webp',
    {
      base: 2,
      growthTime: 3,
    },
    {
      crop: 23,
      cropStar: 34,
      seed: 7,
      seedStar: 10,
      hasPreserve: true,
      preserve: 34,
      preserveStar: 51,
    },
    {
      cropsPerSeed: 1,
      seedsPerConversion: 4,
      cropsPerPreserve: 1,
    },
    {
      preserve: '/jars/carrot.png',
      seed: '/seeds/carrot.png',
    },
    {
      cropCode: CropCode.Carrot,
      cropTooltip: 'Carrot: Weed Prevention',
      cropBackgroundColor: 'bg-fuchsia-800',
    },
  ),
  [CropType.Onion]: new Crop(
    CropType.Onion,
    Bonus.WeedPrevention,
    CropSize.Single,
    '/crops/onion.webp',
    {
      base: 2,
      growthTime: 4,
    },
    {
      crop: 30,
      cropStar: 45,
      seed: 10,
      seedStar: 15,
      hasPreserve: true,
      preserve: 45,
      preserveStar: 67,
    },
    {
      cropsPerSeed: 1,
      seedsPerConversion: 4,
      cropsPerPreserve: 1,
    },
    {
      preserve: '/jars/onion.png',
      seed: '/seeds/onion.png',
    },
    {
      cropCode: CropCode.Onion,
      cropTooltip: 'Onion: Weed Prevention',
      cropBackgroundColor: 'bg-fuchsia-700',
    },
  ),
  [CropType.Cotton]: new Crop(
    CropType.Cotton,
    Bonus.QualityIncrease,
    CropSize.Single,
    '/crops/cotton.webp',
    {
      base: 2,
      growthTime: 5,
    },
    {
      crop: 45,
      cropStar: 67,
      seed: 20,
      seedStar: 30,
      hasPreserve: false,
      preserve: 0,
      preserveStar: 0,
    },
    {
      cropsPerSeed: 1,
      seedsPerConversion: 3,
      cropsPerPreserve: 0,
    },
    {
      preserve: '',
      seed: '/seeds/cotton.png',
    },
    {
      cropCode: CropCode.Cotton,
      cropTooltip: 'Cotton: Quality Increase',
      cropBackgroundColor: 'bg-amber-600',
    },
  ),
  [CropType.Blueberry]: new Crop(
    CropType.Blueberry,
    Bonus.SpeedIncrease,
    CropSize.Bush,
    '/crops/blueberry.webp',
    {
      base: 6,
      growthTime: 9,
      isReharvestable: true,
      reharvestCooldown: 3,
      reharvestLimit: 3,
    },
    {
      crop: 39,
      cropStar: 58,
      seed: 112,
      seedStar: 168,
      hasPreserve: true,
      preserve: 59,
      preserveStar: 88,
    },
    {
      cropsPerSeed: 4,
      seedsPerConversion: 2,
      cropsPerPreserve: 1,
    },
    {
      preserve: '/jars/blueberry.png',
      seed: '/seeds/blueberry.png',
    },
    {
      cropCode: CropCode.Blueberry,
      cropTooltip: 'Berry Bush: Speed Increase. 2x2, needs 2 of a bonus for the buff to activate',
      cropBackgroundColor: 'bg-orange-700',
    },
  ),
  [CropType.Apple]: new Crop(
    CropType.Apple,
    Bonus.SpeedIncrease,
    CropSize.Tree,
    '/crops/apple.webp',
    {
      base: 16,
      growthTime: 12,
      isReharvestable: true,
      reharvestCooldown: 6,
      reharvestLimit: 3,
    },
    {
      crop: 64,
      cropStar: 96,
      seed: 700,
      seedStar: 1050,
      hasPreserve: true,
      preserve: 96,
      preserveStar: 144,
    },
    {
      cropsPerSeed: 10,
      seedsPerConversion: 1,
      cropsPerPreserve: 1,
    },
    {
      preserve: '/jars/apple.png',
      seed: '/seeds/apple.png',
    },
    {
      cropCode: CropCode.Apple,
      cropTooltip: 'Apple Tree: Speed Increase. 3x3, needs 3 of a bonus for the buff to activate',
      cropBackgroundColor: 'bg-orange-700',
    },
  ),
  [CropType.Corn]: new Crop(
    CropType.Corn,
    Bonus.HarvestIncrease,
    CropSize.Single,
    '/crops/corn.webp',
    {
      base: 2,
      growthTime: 5,
    },
    {
      crop: 40,
      cropStar: 60,
      seed: 15,
      seedStar: 22,
      hasPreserve: true,
      preserve: 60,
      preserveStar: 90,
    },
    {
      cropsPerSeed: 1,
      seedsPerConversion: 4,
      cropsPerPreserve: 1,
    },
    {
      preserve: '/jars/corn.webp',
      seed: '/seeds/corn.webp',
    },
    {
      cropCode: CropCode.Corn,
      cropTooltip: 'Corn: Harvest Increase',
      cropBackgroundColor: 'bg-green-800',
    },
  ),
  [CropType.SpicyPepper]: new Crop(
    CropType.SpicyPepper,
    Bonus.QualityIncrease,
    CropSize.Bush,
    '/crops/spicy-pepper.webp',
    {
      base: 6,
      growthTime: 6,
      isReharvestable: true,
      reharvestCooldown: 3,
      reharvestLimit: 3,
    },
    {
      crop: 32,
      cropStar: 48,
      seed: 85,
      seedStar: 127,
      hasPreserve: true,
      preserve: 48,
      preserveStar: 72,
    },
    {
      cropsPerSeed: 4,
      seedsPerConversion: 2,
      cropsPerPreserve: 1,
    },
    {
      preserve: '/jars/spicy-pepper.webp',
      seed: '/seeds/spicy-pepper.webp',
    },
    {
      cropCode: CropCode.SpicyPepper,
      cropTooltip: 'Spicy Pepper: Quality Increase. 2x2, needs 2 of a bonus for the buff to activate',
      cropBackgroundColor: 'bg-amber-600',
    },
  ),
  [CropType.None]: null,
}

function getCropFromCode(code: CropCode): Crop | null {
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
    default:
      return crops[CropType.None]
  }
}

function getCodeFromCrop(crop: Crop): CropCode {
  return crop.cropCode;
}

function getCropFromType(type: CropType): Crop | null {
  return crops[type]
}

export { getCropFromCode, getCodeFromCrop, getCropFromType }
export default crops
