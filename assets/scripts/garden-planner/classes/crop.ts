import type Bonus from '../enums/bonus'
import type CropType from '../enums/crops'
import type CropSize from '../enums/crop-size'
import { CropCode } from '../imports'

/**
 * Used only for constructor
 */
interface IGrowthInfoParams {
  base: number
  withBonus?: number
  growthTime: number
  isReharvestable?: boolean
  reharvestCooldown?: number
  reharvestLimit?: number
}

interface IGrowthInfo extends IGrowthInfoParams {
  withBonus: number // an override incase a crop ever betrays the 1.5x rule
  isReharvestable: boolean

  // for multi-harcest crops
  reharvestLimit: number
  reharvestCooldown: number
}

/**
 * Used only for constructor
 */
interface IGoldValuesParams {
  crop: number
  cropStar: number
  seed: number
  seedStar: number
  preserve: number
  preserveStar?: number
  hasPreserve: boolean
}

interface IGoldValues extends IGoldValuesParams {
  preserveStar: number
}

export interface ICropConversions {
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


interface ICropConstructorParams {
  readonly type: CropType
  readonly cropBonus: Bonus
  readonly size: CropSize
  readonly image: string
  readonly growthInfoData: IGrowthInfoParams
  readonly goldValueData: IGoldValuesParams
  readonly conversionInfo: ICropConversions
  readonly images: IProductImages
  readonly metadata: ICropMetadata
}

/**
 *   constructor(
    public readonly type: CropType,
    public readonly cropBonus: Bonus,
    public readonly size: CropSize,
    public readonly imgSrc: string,
    produceInfoOptions: IGrowthInfoParams,
    goldValuesOptions: IGoldValuesParams,
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
 */
class Crop {
  private _produceInfo: IGrowthInfo
  private _goldValues: IGoldValues
  private _images: {
    preserve: string
    seed: string
  }

  private _metadata: ICropMetadata


  public readonly type: CropType
  public readonly cropBonus: Bonus
  public readonly size: CropSize
  public readonly image: string
  public readonly conversionInfo: ICropConversions // How much of each crop is required to make a seed/preserve

  constructor(params: ICropConstructorParams) {
    this.type = params.type
    this.cropBonus = params.cropBonus
    this.size = params.size
    this.image = params.image
    this.conversionInfo= params.conversionInfo

    this._images = params.images || {
      preserve: '',
      seed: '',
    }

    this._metadata = params.metadata || {
      cropCode: CropCode.None,
      cropTooltip: 'Remove Crop',
      cropBackgroundColor: '',
    }

    this._produceInfo = {
      ...params.growthInfoData,
      withBonus: params.growthInfoData.withBonus || params.growthInfoData.base * 1.5,
      isReharvestable: params.growthInfoData.isReharvestable || false,
      reharvestCooldown: params.growthInfoData.reharvestCooldown || 0,
      reharvestLimit: params.growthInfoData.reharvestLimit || 0,
    }

    this._goldValues = {
      ...params.goldValueData,
      // assume 1.5x rule if not provided
      preserveStar: params.goldValueData.preserveStar || params.goldValueData.preserve * 1.5,
    }
  }

  get produceInfo(): IGrowthInfo {
    return this._produceInfo
  }

  get goldValues(): IGoldValues {
    return this._goldValues
  }

  get cropImage(): string {
    return this.image
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

  getHarvestableDays(hasGrowthBoost: boolean = false): number[] {
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

    return harvestableDays
  }

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
export type { IGrowthInfo as IProduceInfo, IGrowthInfoParams as IProduceInfoOptions }
