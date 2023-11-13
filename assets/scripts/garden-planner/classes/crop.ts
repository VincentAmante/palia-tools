import type Bonus from '../enums/bonus'
import type CropType from '../enums/crops'
import type CropSize from '../enums/crop-size'
import { CropCode } from '../imports'

interface IProduceInfoOptions {
  base: number
  withBonus?: number
  growthTime: number
  isReharvestable?: boolean
  reharvestCooldown?: number
  reharvestLimit?: number
}

interface IProduceInfo extends IProduceInfoOptions {
  // NOTE: withBonus is an override, I'm not sure if all crops follow the (1.5x) rule
  withBonus: number
  isReharvestable: boolean
  reharvestCooldown: number
  reharvestLimit: number // Amount of times the crop can be reharvested
}

interface IGoldValuesOptions {
  crop: number
  cropStar: number
  seed: number
  seedStar: number
  preserve: number
  preserveStar?: number
  hasPreserve: boolean
}

interface IGoldValues extends IGoldValuesOptions {
  preserveStar: number
}

interface ICropConversions {
  cropsPerSeed: number
  seedsPerConversion: number
  cropsPerPreserve: number
  seedProcessMinutes: number
  preserveProcessMinutes: number
}

interface IProductImages {
  preserve: string
  seed: string
}

interface ICropMetadata {
  cropCode: CropCode
  cropTooltip: string
  cropBackgroundColor: string
}

class Crop {
  private _produceInfo: IProduceInfo
  private _goldValues: IGoldValues
  private _images: {
    preserve: string
    seed: string
  }

  private _metadata: ICropMetadata

  constructor(
    public readonly type: CropType,
    public readonly cropBonus: Bonus,
    public readonly size: CropSize,
    public readonly image: string,
    produceInfoOptions: IProduceInfoOptions,
    goldValuesOptions: IGoldValuesOptions,
    public readonly conversionInfo: ICropConversions, // How much of each crop is required to make a seed/preserve
    images: IProductImages = {
      preserve: '',
      seed: '',
    },
    metadata: ICropMetadata = {
      cropCode: CropCode.None,
      cropTooltip: 'Remove Crop',
      cropBackgroundColor: '',
    },
  ) {
    this._images = images
    this._metadata = metadata

    this._produceInfo = {
      ...produceInfoOptions,
      withBonus: produceInfoOptions.withBonus || produceInfoOptions.base * 1.5,
      isReharvestable: produceInfoOptions.isReharvestable || false,
      reharvestCooldown: produceInfoOptions.reharvestCooldown || 0,
      reharvestLimit: produceInfoOptions.reharvestLimit || 0,
    }

    this._goldValues = {
      ...goldValuesOptions,
      preserveStar: goldValuesOptions.preserveStar || goldValuesOptions.preserve * 1.5, // We want to assume the same 1.5x rule if not proivided
    }
  }

  get produceInfo(): IProduceInfo {
    return this._produceInfo
  }

  get goldValues(): IGoldValues {
    return this._goldValues
  }

  get preserveImage(): string {
    return this._images.preserve
  }

  get seedImage(): string {
    return this._images.seed
  }

  get cropCode(): CropCode {
    return this._metadata.cropCode
  }

  get cropTooltip(): string {
    return this._metadata.cropTooltip
  }

  get cropBackgroundColor(): string {
    return this._metadata.cropBackgroundColor
  }

  get paliapediaName(): string {
    return this._metadata.paliapediaName || ''
  }

  // Assumes player harvests on the day it is harvestable
  isHarvestableOnDay(day: number, hasGrowthBoost: boolean = false) {
    let { growthTime, reharvestCooldown, reharvestLimit } = this._produceInfo

    let newReharvestCooldown = reharvestCooldown

    let leftover = 0
    if (hasGrowthBoost) {
      leftover = growthTime % 3
      growthTime = Math.ceil((growthTime / 3) * 2)
      newReharvestCooldown = Math.ceil((reharvestCooldown / 3) * 2)
    }

    const totalGrowthTime = this.getTotalGrowTime(hasGrowthBoost)
    // console.log('totalGrowthTime', totalGrowthTime)

    const onLastHarvest = (day % totalGrowthTime) === 0
    const doReplant = onLastHarvest

    const harvestableDays = []
    harvestableDays.push(growthTime)
    let lastHarvestDay = harvestableDays[harvestableDays.length - 1]

    for (let i = 0; i < reharvestLimit; i++) {
      harvestableDays.push(Math.max(lastHarvestDay + newReharvestCooldown - leftover, 1))
      lastHarvestDay = harvestableDays[harvestableDays.length - 1]
      leftover = harvestableDays[harvestableDays.length - 1] - lastHarvestDay
    }

    if (onLastHarvest) {
      return {
        isHarvestable: true,
        doReplant,
      }
    }
    return {
      isHarvestable: harvestableDays.includes(day % totalGrowthTime),
      doReplant,
    }
  }

  // TODO: Re-do the growth boost logic
  getTotalGrowTime(hasGrowthBoost: boolean = false): number {
    let { growthTime, reharvestCooldown, reharvestLimit } = this._produceInfo

    let newReharvestCooldown = reharvestCooldown

    let leftover = 0
    if (hasGrowthBoost) {
      leftover = growthTime % 3
      growthTime = Math.ceil((growthTime / 3) * 2)
      newReharvestCooldown = Math.ceil((reharvestCooldown / 3) * 2)
    }

    const harvestableDays = []
    harvestableDays.push(growthTime)
    let lastHarvestDay = harvestableDays[harvestableDays.length - 1]

    for (let i = 0; i < reharvestLimit; i++) {
      harvestableDays.push(Math.max(lastHarvestDay + newReharvestCooldown - leftover, 1))
      lastHarvestDay = harvestableDays[harvestableDays.length - 1]
      leftover = harvestableDays[harvestableDays.length - 1] - lastHarvestDay
    }

    return harvestableDays.reduce((acc, cur) => (acc) + (cur - acc), 0)
  }

  calculateGoldValue(
    cropsCount: number,
    type: 'crop' | 'seed' | 'preserve',
    isStar: boolean = false,
  ) {
    const goldValues = this._goldValues
    const { cropsPerSeed, seedsPerConversion, cropsPerPreserve } = this.conversionInfo

    let goldValue = 0
    let remainder = 0
    if (type === 'crop') {
      goldValue = isStar ? cropsCount * goldValues.cropStar : cropsCount * goldValues.crop
    }
    else if (type === 'seed') {
      const cropsNotConverted = cropsCount % cropsPerSeed
      const processCount = ((cropsCount - cropsNotConverted) / cropsPerSeed) * seedsPerConversion

      goldValue = isStar
        ? processCount * goldValues.seedStar
        : processCount * goldValues.seed
      remainder = cropsNotConverted
    }
    else if (type === 'preserve') {
      // This whole section is written in preperation for the idea that more than 1 crop could be used to make a preserve

      if (!goldValues.hasPreserve) {
        console.error('Should not have reached this point')
        throw new Error(
          'Crop is attempting to be sold as a preserve, but it is not meant to be preserved',
        )
      }
      const cropsNotConverted = cropsCount % cropsPerPreserve
      const processCount = (cropsCount - cropsNotConverted) / cropsPerPreserve
      goldValue = isStar
        ? processCount * goldValues.preserveStar
        : processCount * goldValues.preserve

      remainder = cropsNotConverted
    }

    return {
      goldValue,
      remainder,
    }
  }

  convertCropToSeed(cropsCount: number): {
    count: number
    remainder: number
  } {
    const { cropsPerSeed, seedsPerConversion } = this.conversionInfo
    const cropsNotConverted = cropsCount % cropsPerSeed
    const processCount = ((cropsCount - cropsNotConverted) / cropsPerSeed) * seedsPerConversion

    return {
      count: processCount,
      remainder: cropsNotConverted,
    }
  }

  convertCropToPreserve(cropsCount: number): {
    count: number
    remainder: number
  } {
    const { cropsPerPreserve } = this.conversionInfo
    const cropsNotConverted = cropsCount % cropsPerPreserve
    const processCount = (cropsCount - cropsNotConverted) / cropsPerPreserve
    return {
      count: processCount,
      remainder: cropsNotConverted,
    }
  }
}

export default Crop
export type { IProduceInfo, IProduceInfoOptions }
