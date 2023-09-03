import type Bonus from '../enums/bonus'
import type CropType from '../enums/crops'

interface ProduceInfo {
  base: number
  // NOTE: withBonus is an override, I'm not sure if all crops follow the (1.5x) rule
  withBonus: number
  growthTime: number
  isReharvestable: boolean
  reharvestCooldown: number
  reharvestLimit: number // Amount of times the crop can be reharvested
}

interface ProduceInfoOptions {
  base: number
  withBonus?: number
  growthTime: number
  isReharvestable?: boolean
  reharvestCooldown?: number
  reharvestLimit?: number
}

interface GoldValues {
  crop: number
  cropStar: number
  seed: number
  seedStar: number
  preserve: number
  preserveStar: number
  hasPreserve: boolean
}

interface CropConversions {
  cropsPerSeed: number
  seedsPerConversion: number
  cropsPerPreserve: number
}

interface GoldValuesOptions {
  crop: number
  cropStar: number
  seed: number
  seedStar: number
  preserve: number
  preserveStar?: number
  hasPreserve: boolean
}

class Crop {
  private _type: CropType
  private _cropBonus: Bonus
  private _image: string
  private _produceInfo: ProduceInfo
  private _goldValues: GoldValues
  private _conversionInfo: CropConversions
  private _images: {
    preserve: string
    seed: string
  }

  constructor(
    type: CropType,
    cropBonus: Bonus,
    image: string,
    produceInfo: ProduceInfo | ProduceInfoOptions,
    goldValues: GoldValues | GoldValuesOptions,
    conversionInfo: CropConversions, // How much of each crop is required to make a seed/preserve
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
    this._image = image
    this._images = images

    // if produceInfo type is ProduceInfoOptions, then we need to convert it to ProduceInfo
    if ((produceInfo as ProduceInfoOptions).base) {
      const produceInfoOptions = produceInfo as ProduceInfoOptions
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
      this._produceInfo = produceInfo as ProduceInfo
    }

    // if goldValues type is GoldValuesOptions, then we need to convert it to GoldValues
    if ((goldValues as GoldValuesOptions).crop) {
      const goldValuesOptions = goldValues as GoldValuesOptions
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
      this._goldValues = goldValues as GoldValues
    }

    this._conversionInfo = conversionInfo
  }

  get type(): string {
    return this._type
  }

  get image(): string {
    return this._image
  }

  get cropBonus(): string {
    return this._cropBonus
  }

  get produceInfo(): ProduceInfo {
    return this._produceInfo
  }

  get goldValues(): GoldValues {
    return this._goldValues
  }

  get conversionInfo(): CropConversions {
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

    console.log('onLastHarvest', onLastHarvest)

    // // TODO: re-do this logic, it's a bit confusing
    // const cycleDay = day > totalGrowthTime ? day % totalGrowthTime : day
    // const isOnCycleDay = day > totalGrowthTime ? day % totalGrowthTime === 0 : true

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
    // return harvestableDays.includes(cycleDay)
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
export type { ProduceInfo, ProduceInfoOptions }
