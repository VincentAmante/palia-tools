import type Bonus from '../enums/bonus'
import type CropType from '../enums/crops'
import type CropSize from '../enums/crop-size'

interface IProduceInfo {
  base: number
  // NOTE: withBonus is an override, I'm not sure if all crops follow the (1.5x) rule
  withBonus: number
  growthTime: number
  isReharvestable: boolean
  reharvestCooldown: number
  reharvestLimit: number // Amount of times the crop can be reharvested
}

interface IProduceInfoOptions {
  base: number
  withBonus?: number
  growthTime: number
  isReharvestable?: boolean
  reharvestCooldown?: number
  reharvestLimit?: number
}

interface IGoldValues {
  crop: number
  cropStar: number
  seed: number
  seedStar: number
  preserve: number
  preserveStar: number
  hasPreserve: boolean
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

interface ICropConversions {
  cropsPerSeed: number
  seedsPerConversion: number
  cropsPerPreserve: number
}

class Crop {
  private _type: CropType
  private _cropBonus: Bonus
  private _image: string
  private _produceInfo: IProduceInfo
  private _goldValues: IGoldValues
  private _conversionInfo: ICropConversions
  private _size: CropSize
  private _images: {
    preserve: string
    seed: string
  }

  constructor(
    type: CropType,
    cropBonus: Bonus,
    size: CropSize,
    image: string,
    produceInfo: IProduceInfo | IProduceInfoOptions,
    goldValues: IGoldValues | IGoldValuesOptions,
    conversionInfo: ICropConversions, // How much of each crop is required to make a seed/preserve
    images: {
      preserve: string
      seed: string
    } = {
      preserve: '',
      seed: '',
    },
  ) {
    this._type = type
    this._cropBonus = cropBonus
    this._size = size
    this._image = image
    this._images = images

    if ((produceInfo as IProduceInfoOptions).base) {
      const produceInfoOptions = produceInfo as IProduceInfoOptions
      this._produceInfo = {
        base: produceInfoOptions.base,
        withBonus: produceInfoOptions.withBonus || produceInfoOptions.base * 1.5,
        growthTime: produceInfoOptions.growthTime,
        isReharvestable: produceInfoOptions.isReharvestable || false,
        reharvestCooldown: produceInfoOptions.reharvestCooldown || 0,
        reharvestLimit: produceInfoOptions.reharvestLimit || 0,
      }
    }
    else {
      this._produceInfo = produceInfo as IProduceInfo
    }

    if ((goldValues as IGoldValuesOptions).crop) {
      const goldValuesOptions = goldValues as IGoldValuesOptions
      this._goldValues = {
        crop: goldValuesOptions.crop,
        cropStar: goldValuesOptions.cropStar,
        seed: goldValuesOptions.seed,
        seedStar: goldValuesOptions.seedStar,
        preserve: goldValuesOptions.preserve,
        preserveStar: goldValuesOptions.preserveStar || goldValuesOptions.preserve,
        hasPreserve: goldValuesOptions.hasPreserve,
      }
    }
    else {
      this._goldValues = goldValues as IGoldValues
    }

    this._conversionInfo = conversionInfo
  }

  get type(): string {
    return this._type
  }

  get size(): CropSize {
    return this._size
  }

  get image(): string {
    return this._image
  }

  get cropBonus(): string {
    return this._cropBonus
  }

  get produceInfo(): IProduceInfo {
    return this._produceInfo
  }

  get goldValues(): IGoldValues {
    return this._goldValues
  }

  get conversionInfo(): ICropConversions {
    return this._conversionInfo
  }

  get preserveImage(): string {
    return this._images.preserve
  }

  get seedImage(): string {
    return this._images.seed
  }

  // Assumes player harvests on the day it is harvestable
  isHarvestableOnDay(day: number) {
    const { growthTime, reharvestCooldown, reharvestLimit } = this._produceInfo
    const totalGrowthTime = growthTime + (reharvestCooldown * reharvestLimit)
    const onLastHarvest = (day % totalGrowthTime) === 0
    const doReplant = onLastHarvest

    const harvestableDays = []
    harvestableDays.push(growthTime)
    for (let i = 0; i < reharvestLimit; i++)
      harvestableDays.push(growthTime + reharvestCooldown * (i + 1))

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

  get totalGrowTime(): number {
    const { growthTime, reharvestCooldown, reharvestLimit } = this._produceInfo
    return growthTime + reharvestCooldown * reharvestLimit
  }

  calculateGoldValue(
    cropsCount: number,
    type: 'crop' | 'seed' | 'preserve',
    isStar: boolean = false,
  ) {
    const goldValues = this._goldValues
    const { cropsPerSeed, seedsPerConversion, cropsPerPreserve } = this._conversionInfo

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
    const { cropsPerSeed, seedsPerConversion } = this._conversionInfo
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
    const { cropsPerPreserve } = this._conversionInfo
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
